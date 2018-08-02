import { inject, injectable } from "inversify";
import { ComponentService } from "../components/Component.service";
import { LevelComponent } from "../components/LevelComponent";
import { EventResult } from "../EventResult";
import { REvent } from "../events/Event";
import { ISystem } from "./System";

@injectable()
export class LevelSystem implements ISystem {

    constructor(
        @inject("ComponentService") private componentService: ComponentService,
    ) { }

    public onEvent(entityId: number, event: REvent): EventResult[] {
        if (event.type !== "GainXpEvent") {
            return [];
        }

        const result: EventResult[] = [];

        const levelComponent = this.componentService
            .getComponentByEntityIdAndType(entityId, "LevelComponent") as LevelComponent;
        if (levelComponent) {
            const didLevelUp = LevelComponent.addXp(levelComponent, event.xp);
            if (didLevelUp) {
                result.push({
                    type: "leveledUp",
                });
            }
        }

        return result;
    }
}
