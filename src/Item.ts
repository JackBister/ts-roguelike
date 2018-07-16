import * as ROT from "rot-js";

import { Entity } from "./Entity";
import { ITurnResult } from "./TurnResult";

export interface IItem {
    owner: Entity;
    readonly name: string;
    readonly requiresTarget?: boolean;

    use: (user: Entity, entities: Entity[], fov: ROT.FOV, targetX?: number, targetY?: number) => ITurnResult[];
}
