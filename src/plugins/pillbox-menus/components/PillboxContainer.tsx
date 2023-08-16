import PillboxMenus from "..";
import "./PillboxContainer.less";
import { Component, jsx } from "DCGView";
import { If, Tooltip, For } from "components/desmosComponents";
import { Calc } from "globals/window";
import { format } from "i18n/i18n-core";

export default class PillboxContainer extends Component<{
  pm: PillboxMenus;
  horizontal: boolean;
}> {
  pm!: PillboxMenus;
  horizontal!: boolean;

  init() {
    this.pm = this.props.pm();
    this.horizontal = this.props.horizontal();
  }

  template() {
    return (
      <If
        predicate={() =>
          this.horizontal === this.pm.showHorizontalPillboxMenu()
        }
      >
        {() => this.templateTrue()}
      </If>
    );
  }

  templateTrue() {
    return (
      <div class="dsm-pillbox-and-popover">
        <For each={() => this.pm.getPillboxButtonsOrder()} key={(id) => id}>
          <div
            class={{
              "dsm-pillbox-buttons": true,
              "dsm-horizontal-pillbox": this.horizontal,
            }}
          >
            {(id: string) => (
              <Tooltip
                tooltip={() => format(this.pm.getPillboxButton(id).tooltip)}
                gravity={() => (this.horizontal ? "s" : "w")}
              >
                <div
                  class={() =>
                    this.horizontal
                      ? "dcg-icon-btn"
                      : "dcg-btn-flat-gray dcg-settings-pillbox dcg-action-settings dsm-action-menu"
                  }
                  role="button"
                  onTap={() => this.onTapMenuButton(id)}
                  // TODO: manageFocus?
                  style={() =>
                    this.horizontal
                      ? {}
                      : {
                          background:
                            Calc.controller.getPillboxBackgroundColor(),
                        }
                  }
                >
                  <i
                    class={() => this.pm.getPillboxButton(id).iconClass ?? ""}
                  />
                </div>
              </Tooltip>
            )}
          </div>
        </For>
        {this.pm.dsm.insertElement(() => this.pm.pillboxMenuView(false))}
      </div>
    );
  }

  onTapMenuButton(id: string) {
    this.pm.toggleMenu(id);
  }
}
