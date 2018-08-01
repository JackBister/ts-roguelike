import { ITurnResult } from "../TurnResult";
import { ISystem } from "./System";

export class StairSystem implements ISystem {

    public onEvent(entityId: number, event: string): ITurnResult[] {
        return [];
        if (event !== "on-enter") {
            return [];
        }
    }
}
