import { IEvent } from "./Event";

export class UseEvent implements IEvent {
    public readonly type: "UseEvent" = "UseEvent";

    constructor(public readonly instigatorId: number,
                public readonly targetX?: number,
                public readonly targetY?: number) {}
}
