
export type IAction = IDropAction
                    | IEnterAction
                    | IExitAction
                    | IMoveAction
                    | IOpenCharacterPanelAction
                    | IOpenInventoryAction
                    | IPickupAction
                    | IWaitAction;

export interface IDropAction {
    type: "drop";
}

export interface IEnterAction {
    type: "enter";
}

export interface IExitAction {
    type: "exit";
}

export interface IMoveAction {
    type: "move";
    dir: [number, number];
}

export interface IOpenCharacterPanelAction {
    type: "open-character-panel";
}

export interface IOpenInventoryAction {
    type: "open-inventory";
}

export interface IPickupAction {
    type: "pickup";
}

export interface IWaitAction {
    type: "wait";
}
