import { IEvent } from "./Event";

export class GainXpEvent implements IEvent {
    public readonly type: "GainXpEvent" = "GainXpEvent";
    constructor(public readonly xp: number) {}
}
