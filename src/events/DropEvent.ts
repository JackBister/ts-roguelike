import { IEvent } from "./Event";

export class DropEvent implements IEvent {
    public readonly type: "DropEvent" = "DropEvent";

    constructor(public readonly instigatorId: number) {}
}
