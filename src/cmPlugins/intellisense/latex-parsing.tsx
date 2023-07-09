import { latexStringToIdentifierString } from "./view";
import { ExpressionAug } from "cmPlugins/text-mode/aug/AugState";
import { MQCursor, MathQuillField } from "components";

export function mapAugAST(
  node: ExpressionAug["latex"],
  callback: (node: ExpressionAug["latex"]) => void
) {
  function map(x: any) {
    if (Array.isArray(x)) {
      for (const child of x) {
        map(child);
      }
    }

    if (typeof x === "object") {
      if (typeof x.type === "string") callback(x);

      for (const [_, v] of Object.entries(x)) {
        map(v);
      }
    }
  }

  map(node);
}

export function getController(mq: MathQuillField) {
  return mq.__controller;
}

export function mqKeystroke(mq: MathQuillField, keystroke: string) {
  mq.keystroke(keystroke);
}

export function isIdentStr(str: string) {
  return latexStringToIdentifierString(str) !== undefined;
}

export interface TryFindMQIdentResult {
  goToEndOfIdent: () => void;
  deleteIdent: () => void;
  ident: string;
  type: string;
}

// is an MQ node a subscript?
function isSubscript(cursor: MQCursor) {
  const ltx = cursor.latex?.();
  return ltx?.[0] === "_" && ltx[1] === "{" && ltx[ltx.length - 1] === "}";
}

// is an MQ node an operator name?
function isOperatorName(cursor: MQCursor) {
  return cursor._el?.classList.contains("dcg-mq-operator-name") ?? false;
}

// is an MQ node the start of an operator name?
function isStartingOperatorName(cursor: MQCursor) {
  return isOperatorName(cursor) && cursor.latex?.()?.[0] === "\\";
}

// is an MQ node a variable name
function isVarName(cursor: MQCursor) {
  return cursor._el?.tagName.toUpperCase() === "VAR" && !isOperatorName(cursor);
}

function isIdentifierSegment(cursor?: MQCursor): cursor is MQCursor {
  return (
    (cursor ?? false) &&
    (isSubscript(cursor as MQCursor) ||
      isOperatorName(cursor as MQCursor) ||
      isStartingOperatorName(cursor as MQCursor) ||
      isVarName(cursor as MQCursor))
  );
}

// identifiers are composed of the following structure:
// (operatorname* | varname) subscript?

function tryGetMathquillIdent(
  mq: MathQuillField
): TryFindMQIdentResult | undefined {
  const ctrlr = getController(mq);

  const latexSegments: (string | undefined)[] = [];

  let node = ctrlr.cursor[-1];

  const isInSubscript =
    ctrlr.cursor?.parent?._el?.classList.contains("dcg-mq-sub");

  let goToEnd = 0;

  if (isInSubscript) {
    node = ctrlr.cursor;
    goToEnd++;
    while (node?.[1]) {
      goToEnd++;
      node = node?.[1];
    }
    node = node?.parent?.parent;
  }

  while (node && !isStartingOperatorName(node) && !isVarName(node)) {
    if (!isIdentifierSegment(node)) return;
    node = node[-1];
    goToEnd--;
  }
  if (!node) return;

  let backspaces = 1;

  // get starting variable name
  if (isVarName(node)) {
    latexSegments.push(node.latex?.());
    node = node[1];
    goToEnd++;
    backspaces++;

    // try to get sequence of operatorname characters.
  } else if (isStartingOperatorName(node)) {
    while (node && isOperatorName(node)) {
      latexSegments.push(node.latex?.());
      node = node[1];
      goToEnd++;
      backspaces++;
    }
  }

  let hasSubscript = false;

  // get optional subscript
  if (node && isSubscript(node)) {
    latexSegments.push(node.latex?.());

    backspaces += (node.latex?.()?.length ?? 4) - 3;

    hasSubscript = true;

    goToEnd++;
  }

  const identString = latexSegments.filter((e) => e).join("");

  const normalizedIdentStr = latexStringToIdentifierString(
    identString.replace(" _{ }", "")
  );

  if (normalizedIdentStr) {
    if (!hasSubscript) {
      goToEnd = 0;
      backspaces = 1;
    } else {
      backspaces = Math.max(backspaces, 2);
    }

    return {
      ident: normalizedIdentStr,
      type: "",
      goToEndOfIdent: () => {
        for (let i = 0; i < goToEnd; i++) {
          mq.keystroke("Right");
        }
      },
      deleteIdent: () => {
        for (let i = 0; i < backspaces; i++) {
          mq.keystroke("Backspace");
        }
      },
    };
  }
}

export function getMathquillIdentifierAtCursorPosition(
  mq: MathQuillField
): TryFindMQIdentResult | undefined {
  return tryGetMathquillIdent(mq);
}

export interface PartialFunctionCall {
  ident: string;
  paramIndex: number;
}

export function getPartialFunctionCall(
  mq: MathQuillField
): PartialFunctionCall | undefined {
  let cursor: MQCursor | undefined = getController(mq).cursor;
  let paramIndex = 0;
  while (cursor) {
    const ltx = cursor?.latex?.();
    if (ltx === ",") paramIndex++;
    if (cursor[-1]) {
      cursor = cursor[-1];
    } else {
      const oldCursor = cursor;
      cursor = cursor.parent?.parent?.[-1];

      // TODO: maybe add support for cursed operatornames in the future?
      // or more likely builtins
      const ltx = cursor?.latex?.();
      const ltx2 = cursor?.[-1]?.latex?.();
      if (ltx && isIdentStr(ltx) && cursor?.[1]?.ctrlSeq === "\\left(") {
        return {
          ident: latexStringToIdentifierString(ltx) as string,
          paramIndex,
        };
      } else if (
        ltx2 &&
        ltx &&
        isIdentStr(ltx2 + ltx) &&
        cursor?.[1]?.ctrlSeq === "\\left("
      ) {
        const str = latexStringToIdentifierString(ltx2 + ltx);
        return {
          ident: str as string,
          paramIndex,
        };
      }
      paramIndex = 0;
      cursor = oldCursor.parent;
    }
  }
}
