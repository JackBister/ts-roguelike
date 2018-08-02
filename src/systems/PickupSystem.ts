import { inject, injectable } from "inversify";
import { ComponentService } from "../components/Component.service";
import { InventoryComponent } from "../components/InventoryComponent";
import { LevelComponent } from "../components/LevelComponent";
import { EntityService } from "../entities/Entity.service";
import { Entity } from "../Entity";
import { REvent } from "../events/Event";
import { Message } from "../Message";
import { ITurnResult } from "../TurnResult";
import { ISystem } from "./System";

@injectable()
export class PickupSystem implements ISystem {

    constructor(
        @inject("EntityService") private entityService: EntityService,
        @inject("ComponentService") private componentService: ComponentService,
    ) { }

    public onEvent(entityId: number, event: REvent): ITurnResult[] {
        if (event.type !== "DropEvent" && event.type !== "PickupEvent") {
            return [];
        }

        const item = this.entityService.getEntityById(entityId);
        const instigatorInventory = this.componentService
            .getComponentByEntityIdAndType(event.instigatorId, "InventoryComponent") as InventoryComponent;
        const canBePickedUp = this.componentService.entityHasComponentOfType(entityId, "PickupableComponent");

        if (!item || !canBePickedUp || !instigatorInventory) {
            return [];
        }

        switch (event.type) {
            case "DropEvent":
                return this.onDrop(entityId, event.instigatorId, item, instigatorInventory);
            case "PickupEvent":
                return this.onPickup(entityId, item, instigatorInventory);
        }
    }

    private onDrop(entityId: number,
                   instigatorId: number,
                   item: Entity,
                   dropperInventory: InventoryComponent,
    ): ITurnResult[] {
        const results: ITurnResult[] = [];

        // TODO: This will be handled by the EquippableComponent
        /*
        if (this.owner.equipment
            && item.equippable
            && this.owner.equipment.equipped.includes(item.equippable)
        ) {
            Equipment.toggleEquip(this.owner.equipment, item.equippable);
        }
        */

        const dropper = this.entityService.getEntityById(instigatorId);

        item.x = dropper.x;
        item.y = dropper.y;
        dropperInventory.items = dropperInventory.items.filter((eid) => eid !== entityId);

        results.push({
            itemDropped: item.id,
            message: new Message(`You drop the ${item.name}.`, "yellow"),
        });

        return results;
    }

    private onPickup(entityId: number, item: Entity, pickerInventory: InventoryComponent): ITurnResult[] {
        const result: ITurnResult[] = [];

        if (pickerInventory.items.length >= pickerInventory.capacity) {
            result.push({ message: new Message("Your inventory is full.", "yellow") });
        } else {
            result.push({
                itemAdded: entityId,
                message: new Message(`You pick up the ${item.name}!`, "blue"),
            });
            pickerInventory.items.push(entityId);
        }

        return result;
    }
}
