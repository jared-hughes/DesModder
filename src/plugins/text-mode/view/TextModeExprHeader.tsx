import TextMode from "..";
import TextModeToggle from "./TextModeToggle";
import { Component, jsx } from "DCGView";
import { If, Tooltip } from "components";
import { Calc } from "globals/window";

export default class TextModeExprHeader extends Component<{
  controller: typeof Calc.controller;
  textMode: TextMode;
}> {
  controller!: typeof Calc.controller;
  textMode!: TextMode;

  init() {
    this.controller = this.props.controller();
    this.textMode = this.props.textMode();
  }

  template() {
    return (
      <div class="dcg-expression-top-bar">
        <div class="dcg-left-buttons">
          <If predicate={() => this.controller.anyItemDependsOnRandomSeed()}>
            {() => (
              <Tooltip
                tooltip={() =>
                  this.controller.s(
                    "graphing-calculator-label-randomize-tooltip"
                  )
                }
                gravity={() => (this.controller.isNarrow() ? "n" : "s")}
              >
                <span
                  class="dcg-icon-btn"
                  handleEvent="true"
                  role="button"
                  tabindex="0"
                  onTap={() =>
                    this.controller.dispatch({ type: "re-randomize" })
                  }
                >
                  <i class="dcg-icon-randomize" aria-hidden="true" />
                </span>
              </Tooltip>
            )}
          </If>
        </div>

        <div class="dcg-center-buttons">
          <Tooltip
            tooltip={() =>
              this.controller.s("graphing-calculator-label-undo-tooltip")
            }
            gravity={() => (this.controller.isNarrow() ? "n" : "s")}
            disabled={() => !this.textMode.canUndo()}
          >
            <span
              class={() => ({
                "dcg-action-undo": true,
                "dcg-icon-btn": true,
                "dcg-disabled": !this.textMode.canUndo(),
              })}
              tabindex={() => (this.textMode.canUndo() ? 0 : -1)}
              onTap={() => this.textMode.undo()}
            >
              <i class="dcg-icon-undo" aria-hidden="true" />
            </span>
          </Tooltip>
          <Tooltip
            tooltip={() =>
              this.controller.s("graphing-calculator-label-redo-tooltip")
            }
            gravity={() => (this.controller.isNarrow() ? "n" : "s")}
            disabled={() => !this.textMode.canRedo()}
          >
            <span
              class={() => ({
                "dcg-action-redo": true,
                "dcg-icon-btn": true,
                "dcg-disabled": !this.textMode.canRedo(),
              })}
              tabindex={() => (this.textMode.canRedo() ? 0 : -1)}
              onTap={() => this.textMode.redo()}
            >
              <i class="dcg-icon-redo" aria-hidden="true" />
            </span>
          </Tooltip>
        </div>

        <div class="dcg-right-buttons">
          <TextModeToggle {...this.props} />

          <If predicate={() => Calc.settings.graphpaper}>
            {() => (
              <Tooltip
                tooltip={() =>
                  this.controller.s(
                    "graphing-calculator-label-hide-expression-list-tooltip"
                  )
                }
                gravity={() => (this.controller.isNarrow() ? "nw" : "sw")}
              >
                {" "}
                <span
                  class={() => ({
                    "dcg-resize-list-btn": true,
                    "dcg-action-hideexpressions": true,
                    "dcg-icon-btn": true,
                    "dcg-rotated": this.controller.isNarrow(),
                  })}
                  tabindex="0"
                  onTap={(e: any) => {
                    this.controller.dispatch({
                      type: "hide-expressions-list",
                      focusShowIcon: e.device === "keyboard",
                    });
                  }}
                >
                  <i class="dcg-icon-hide" aria-hidden="true" />
                </span>
              </Tooltip>
            )}
          </If>
        </div>
      </div>
    );
  }
}
