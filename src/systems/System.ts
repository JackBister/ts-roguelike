import { ITurnResult } from "../TurnResult";

export interface ISystem {
    // TODO: Event type
    onEvent(entityId: number, event: string): ITurnResult[];
}
