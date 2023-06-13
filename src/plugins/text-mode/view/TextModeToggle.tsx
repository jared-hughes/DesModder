import TextMode from "..";
import { Component, jsx } from "DCGView";
import { Tooltip } from "components/desmosComponents";
import { Calc } from "globals/window";
import { format } from "i18n/i18n-core";

export default class TextModeToggle extends Component<{
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
      <Tooltip
        tooltip={() => format("text-mode-toggle")}
        gravity={this.controller.isNarrow() ? "n" : "s"}
      >
        <span
          class="dcg-icon-btn"
          handleEvent="true"
          role="button"
          tabindex="0"
          onTap={() => this.textMode.toggleTextMode()}
        >
          <i class="dcg-icon-title" />
        </span>
      </Tooltip>
    );
  }
}
