import { AiComponent } from "./AiComponent";
import { FighterComponent } from "./FighterComponent";
import { StairComponent } from "./StairComponent";

export interface IComponent {
    id: number;
    isActive: boolean;
    readonly ownerId: number;
    // readonly type: string;
}

export type Component = AiComponent
                      | FighterComponent
                      | StairComponent;