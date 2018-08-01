import { IEvent } from "./Event";

export class ThinkEvent implements IEvent {
    public readonly type: "ThinkEvent" = "ThinkEvent";
}
