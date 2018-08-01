import { REvent } from "../events/Event";
import { ITurnResult } from "../TurnResult";
import { ISystem } from "./System";

export class StairSystem implements ISystem {

    public onEvent(entityId: number, event: REvent): ITurnResult[] {
        return [];
        if (event.type !== "EnterEvent") {
            return [];
        }
    }
}
