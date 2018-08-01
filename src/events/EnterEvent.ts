import { IEvent } from "./Event";

export class EnterEvent implements IEvent {
    public readonly type: "EnterEvent" = "EnterEvent";
}
