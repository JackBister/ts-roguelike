import { injectable } from "inversify";
import { REvent } from "../events/Event";
import { ITurnResult } from "../TurnResult";
import { ISystem } from "./System";

@injectable()
export class SystemService {
    public readonly systems: ISystem[] = [];

    public addSystem(s: ISystem): void {
        this.systems.push(s);
    }

    public dispatchEvent(entityId: number, event: REvent): ITurnResult[] {
        let results: ITurnResult[] = [];
        for (const s of this.systems) {
            results = results.concat(s.onEvent(entityId, event));
        }
        return results;
    }
}
