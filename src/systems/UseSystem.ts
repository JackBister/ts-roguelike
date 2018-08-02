import { inject, injectable } from "inversify";
import { ComponentService } from "../components/Component.service";
import { InventoryComponent } from "../components/InventoryComponent";
import { LevelComponent } from "../components/LevelComponent";
import { UsableComponent } from "../components/UsableComponent";
import { REvent } from "../events/Event";
import { UseFunctionsService } from "../services/UseFunctions.service";
import { ITurnResult } from "../TurnResult";
import { ISystem } from "./System";
import { SystemService } from "./System.service";

@injectable()
export class UseSystem implements ISystem {

    constructor(
        @inject("ComponentService") private componentService: ComponentService,
        @inject("UseFunctionsService") private useFunctionsService: UseFunctionsService,
        @inject("SystemService") private systems: SystemService,

    ) { }

    public onEvent(entityId: number, event: REvent): ITurnResult[] {
        if (event.type !== "UseEvent") {
            return [];
        }

        /*
        if (!this.items[index].item) {
            if (this.items[index].equippable) {
                results.push({ equip: this.items[index] });
            } else {
                results.push({ message: new Message(`The ${this.items[index].name} cannot be used.`, "yellow") });
            }
            return results;
        }
        */

        const usable = this.componentService
            .getComponentByEntityIdAndType(entityId, "UsableComponent") as UsableComponent;

        if (!usable) {
            return [];
        }

        let results: ITurnResult[] = [];

        if (usable.requiresTargeting && event.targetX === undefined && event.targetY === undefined) {
            results.push({
                targeting: entityId,
            });
            return results;
        }

        const itemUseResults = this.useFunctionsService.getFunction(usable.useFunction)(entityId, event);

        if (itemUseResults.some((r) => r.consumed)) {
            // TODO:
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
