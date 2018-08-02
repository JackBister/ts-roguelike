import { inject, injectable } from "inversify";
import { ComponentService } from "../components/Component.service";
import { StairComponent } from "../components/StairComponent";
import { EventResult } from "../EventResult";
import { REvent } from "../events/Event";
import { ISystem } from "./System";

@injectable()
export class StairSystem implements ISystem {

    constructor(
        @inject("ComponentService") private componentService: ComponentService,
    ) { }

    public onEvent(entityId: number, event: REvent): EventResult[] {
        if (event.type !== "EnterEvent") {
            return [];
        }

        const stairComponent = this.componentService
            .getComponentByEntityIdAndType(entityId, "StairComponent") as StairComponent;

        if (!stairComponent) {
            return [];
        }

        return [{
            newMapId: stairComponent.mapId,
            type: "stairsEntered",
        }];
    }
}
