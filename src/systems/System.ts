import { REvent } from "../events/Event";
import { ITurnResult } from "../TurnResult";

export interface ISystem {
    onEvent(entityId: number, event: REvent): ITurnResult[];
}
