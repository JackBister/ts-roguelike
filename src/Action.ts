
export type IAction = IExitAction | IMoveAction | IOpenInventoryAction | IPickupAction;

export interface IExitAction {
    type: "exit";
}

export interface IMoveAction {
    type: "move";
    to: [number, number];
}

export interface IOpenInventoryAction {
    type: "open-inventory";
}

export interface IPickupAction {
    type: "pickup";
}
