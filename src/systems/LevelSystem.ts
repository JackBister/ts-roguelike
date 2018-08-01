import { inject, injectable } from "inversify";
import { ComponentService } from "../components/Component.service";
import { LevelComponent } from "../components/LevelComponent";
import { REvent } from "../events/Event";
import { ITurnResult } from "../TurnResult";
import { ISystem } from "./System";

@injectable()
export class LevelSystem implements ISystem {

    constructor(
        @inject("ComponentService") private componentService: ComponentService,
    ) { }

    public onEvent(entityId: number, event: REvent): ITurnResult[] {
        if (event.type !== "GainXpEvent") {
            return [];
        }

        const result: ITurnResult[] = [];

        const levelComponent = this.componentService
            .getComponentByEntityIdAndType(entityId, "LevelComponent") as LevelComponent;
        if (levelComponent) {
            const didLevelUp = LevelComponent.addXp(levelComponent, event.xp);
            result.push({
                leveledUp: didLevelUp,
            });
        }

        return result;
    }
}
