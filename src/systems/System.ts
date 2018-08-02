import { EventResult } from "../EventResult";
import { REvent } from "../events/Event";

export interface ISystem {
    onEvent(entityId: number, event: REvent): EventResult[];
}
