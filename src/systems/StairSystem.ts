import { EventResult } from "../EventResult";
import { REvent } from "../events/Event";
import { ISystem } from "./System";

export class StairSystem implements ISystem {

    public onEvent(entityId: number, event: REvent): EventResult[] {
        return [];
        if (event.type !== "EnterEvent") {
            return [];
        }
    }
}
