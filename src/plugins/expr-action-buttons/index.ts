import { Inserter, PluginController } from "../PluginController";
import { ActionButtons } from "./components/ActionButtons";
import { ItemModel } from "globals/models";

export default class ExprActionButtons extends PluginController<undefined> {
  static id = "expr-action-buttons" as const;
  static enabledByDefault = true;

  facets = [
    {
      facetID: "expr-action-buttons",
      combine: (
        values: readonly { plugin: string; buttons: ActionButton[] }[]
      ): ActionButtonWithKey[] => {
        return values.flatMap(({ plugin, buttons }) =>
          buttons.map((b, i) => ({ ...b, key: `${plugin}:${i}` }))
        );
      },
    },
  ];

  beforeDisable() {
    throw new Error(
      "Programming Error: core plugin Expression Action Buttons should not be disableable"
    );
  }

  actionButtonsView(m: ItemModel): Inserter {
    return () => ActionButtons(this, m);
  }

  order() {
    return this.dsm.getFacetValue(
      "expr-action-buttons"
    ) as ActionButtonWithKey[];
  }
}

export interface ActionButton {
  tooltip: string;
  buttonClass: string;
  iconClass: string;
  predicate: (m: ItemModel) => boolean;
  onTap: (m: ItemModel) => void;
}

interface ActionButtonWithKey extends ActionButton {
  key: string;
}
