import { injectable } from "inversify";
import { EventResult } from "../EventResult";
import { REvent } from "../events/Event";
import { ISystem } from "./System";

@injectable()
export class SystemService {
    public readonly systems: ISystem[] = [];

    public addSystem(s: ISystem): void {
        this.systems.push(s);
    }

    public dispatchEvent(entityId: number, event: REvent): EventResult[] {
        let results: EventResult[] = [];
        for (const s of this.systems) {
            results = results.concat(s.onEvent(entityId, event));
        }
        return results;
    }

    public multiDispatchEvent(entityId: number[], event: REvent): EventResult[] {
        let results: EventResult[] = [];
        for (const e of entityId) {
            results = results.concat(this.dispatchEvent(e, event));
        }
        return results;
    }
}
