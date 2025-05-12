export interface Span {
  input: string;
  start: number;
  end: number;
}

export interface Token {
  span: Span;
  val: string;
}

export interface Cmd extends Token {
  type: "Cmd";
}
export interface EscapedSymbol extends Token {
  type: "EscapedSymbol";
}
export interface Letter extends Token {
  type: "Letter";
}
export interface Digit extends Token {
  type: "Digit";
}
export interface Symbol extends Token {
  type: "Symbol";
}

export interface Group {
  type: "Group";
  args: Atom[];
  span: Span;
}

export interface Sqrt {
  type: "Sqrt";
  optArg: Group | undefined;
  arg: Group;
  span: Span;
}

export interface Frac {
  type: "Frac";
  num: Group;
  den: Group;
  span: Span;
}

export interface SupSub {
  type: "SupSub";
  sub: Group | undefined;
  sup: Group | undefined;
  nprimes: number;
  span: Span;
}

export interface OperatorName {
  type: "OperatorName";
  arg: Group;
  span: Span;
}

export interface TokenNode {
  type: "TokenNode";
  arg: Group;
  span: Span;
}

export interface LeftRight {
  type: "LeftRight";
  left: Token;
  right: Token;
  arg: Group;
  span: Span;
}

export type Atom =
  | Sqrt
  | Frac
  | SupSub
  | LeftRight
  | OperatorName
  | TokenNode
  | Cmd
  | EscapedSymbol
  | Letter
  | Digit
  | Symbol;

export type LatexTree = Group;
