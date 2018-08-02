import { IEvent } from "./Event";

export class PickupEvent implements IEvent {
    public readonly type: "PickupEvent" = "PickupEvent";

    constructor(public readonly instigatorId: number) {}
}
