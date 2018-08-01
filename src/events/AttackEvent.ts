import { IEvent } from "./Event";

export class AttackEvent implements IEvent {
    public readonly type: "AttackEvent" = "AttackEvent";

    constructor(public readonly attackerId: number) {}
}
