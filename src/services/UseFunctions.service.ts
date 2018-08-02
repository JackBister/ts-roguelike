import { UseEvent } from "../events/UseEvent";
import { ITurnResult } from "../TurnResult";

export type UseFunction = (entityId: number, event: UseEvent) => ITurnResult[];

export class UseFunctionsService {
    private useFunctions: Map<string, UseFunction> = new Map<string, UseFunction>();

    public addFunction(name: string, fn: UseFunction) {
        this.useFunctions[name] = fn;
    }

    public getFunction(name: string) {
        return this.useFunctions[name];
    }
}
