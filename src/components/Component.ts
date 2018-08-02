import { AiComponent } from "./AiComponent";
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
    | FighterComponent
    | InventoryComponent
    | LevelComponent
    | PickupableComponent
    | StairComponent
    | UsableComponent;
