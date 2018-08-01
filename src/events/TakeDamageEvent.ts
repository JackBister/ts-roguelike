import { IEvent } from "./Event";

export class TakeDamageEvent implements IEvent {
    public readonly type: "TakeDamageEvent" = "TakeDamageEvent";

    constructor(public readonly damage: number) {}
}
