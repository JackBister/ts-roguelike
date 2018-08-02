import { IEvent } from "./Event";

export class GetPropertyEvent implements IEvent {
    public readonly type: "GetPropertyEvent" = "GetPropertyEvent";
    constructor(public readonly propertyName: string) {}
}
