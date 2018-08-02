import { AiComponent } from "./AiComponent";
import { EquipmentComponent } from "./EquipmentComponent";
import { EquippableComponent } from "./EquippableComponent";
import { FighterComponent } from "./FighterComponent";
import { InventoryComponent } from "./InventoryComponent";
import { LevelComponent } from "./LevelComponent";
import { PickupableComponent } from "./PickupableComponent";
import { StairComponent } from "./StairComponent";
import { UsableComponent } from "./UsableComponent";

export interface IComponent {
    id: number;
    isActive: boolean;
    readonly ownerId: number;
    // readonly type: string;
}

export type Component = AiComponent
    | EquippableComponent
    | EquipmentComponent
    | FighterComponent
    | InventoryComponent
    | LevelComponent
    | PickupableComponent
    | StairComponent
    | UsableComponent;
