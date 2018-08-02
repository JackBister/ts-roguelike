import { inject, injectable } from "inversify";
import { ComponentService } from "../components/Component.service";
import { InventoryComponent } from "../components/InventoryComponent";
import { LevelComponent } from "../components/LevelComponent";
import { UsableComponent } from "../components/UsableComponent";
import { EventResult } from "../EventResult";
import { REvent } from "../events/Event";
import { UseFunctionsService } from "../services/UseFunctions.service";
import { ISystem } from "./System";
import { SystemService } from "./System.service";

@injectable()
export class UseSystem implements ISystem {

    constructor(
        @inject("ComponentService") private componentService: ComponentService,
        @inject("UseFunctionsService") private useFunctionsService: UseFunctionsService,
        @inject("SystemService") private systems: SystemService,

    ) { }

    public onEvent(entityId: number, event: REvent): EventResult[] {
        if (event.type !== "UseEvent") {
            return [];
        }

        const usable = this.componentService
            .getComponentByEntityIdAndType(entityId, "UsableComponent") as UsableComponent;

        if (!usable) {
            return [];
        }

        let results: EventResult[] = [];

        if (usable.requiresTargeting && event.targetX === undefined && event.targetY === undefined) {
            results.push({
                targeting: entityId,
                type: "targeting",
            });
            return results;
        }

        const itemUseResults: EventResult[] = this.useFunctionsService.getFunction(usable.useFunction)(entityId, event);

        if (itemUseResults.some((r) => r.type === "consumed")) {
            const inventoryComponent = this.componentService
                .getComponentByEntityIdAndType(event.instigatorId, "InventoryComponent") as InventoryComponent;

            if (inventoryComponent) {
                inventoryComponent.items = inventoryComponent.items.filter((eid) => eid !== entityId);
            }
        }

        results = results.concat(itemUseResults);

        return results;
    }
}
