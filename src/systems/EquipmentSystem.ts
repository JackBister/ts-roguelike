import { inject, injectable } from "inversify";
import { ComponentService } from "../components/Component.service";
import { EquipmentComponent } from "../components/EquipmentComponent";
import { EquippableComponent } from "../components/EquippableComponent";
import { EventResult } from "../EventResult";
import { REvent } from "../events/Event";
import { GetPropertyEvent } from "../events/GetPropertyEvent";
import { UseEvent } from "../events/UseEvent";
import { ISystem } from "./System";
import { SystemService } from "./System.service";

@injectable()
export class EquipmentSystem implements ISystem {
    constructor(
        @inject("ComponentService") private componentService: ComponentService,
        @inject("SystemService") private systemService: SystemService,
    ) { }

    public onEvent(entityId: number, event: REvent): EventResult[] {
        if (event.type !== "GetPropertyEvent" && event.type !== "UseEvent") {
            return [];
        }

        switch (event.type) {
            case "GetPropertyEvent":
                return this.onGetProperty(entityId, event);
            case "UseEvent":
                return this.onUse(entityId, event);
        }
    }

    private onGetProperty(entityId: number, event: GetPropertyEvent) {
        const equipment = this.componentService
            .getComponentByEntityIdAndType(entityId, "EquipmentComponent") as EquipmentComponent;
        const equippable = this.componentService
            .getComponentByEntityIdAndType(entityId, "EquippableComponent") as EquippableComponent;
        if (equipment) {
            return this.systemService.multiDispatchEvent(equipment.equipped, event);
        } else if (equippable) {
            const ret: EventResult = { type: "getProperty", value: null };
            switch (event.propertyName) {
                case "defense":
                    ret.value = equippable.defenseBonus;
                    break;
                case "maxHp":
                    ret.value = equippable.maxHpBonus;
                    break;
                case "power":
                    ret.value = equippable.powerBonus;
                    break;
                default:
                    return [];
            }
            return [ret];
        }
        return [];
    }

    private onUse(entityId: number, event: UseEvent) {
        const equippable = this.componentService
            .getComponentByEntityIdAndType(entityId, "EquippableComponent") as EquippableComponent;
        const equipment = this.componentService
            .getComponentByEntityIdAndType(event.instigatorId, "EquipmentComponent") as EquipmentComponent;

        if (!equippable || !equipment) {
            return [];
        }

        const results: EventResult[] = [];

        if (equipment.equipped[equippable.slot] === entityId) {
            equipment.equipped[equippable.slot] = null;
            results.push({
                dequipped: entityId,
                type: "dequipped",
            });
        } else {
            if (equipment.equipped[equippable.slot]) {
                results.push({
                    dequipped: equipment.equipped[equippable.slot],
                    type: "dequipped",
                });
            }
            equipment.equipped[equippable.slot] = entityId;
            results.push({
                equipped: entityId,
                type: "equipped",
            });
        }

        return results;
    }
}
