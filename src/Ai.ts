import * as ROT from "rot-js";

import { Entity } from "./Entity";
import { GameMap } from "./GameMap";
import { ITurnResult } from "./TurnResult";

export interface IAi {
    owner: Entity;

    takeTurn(target: Entity, fov: ROT.FOV, map: GameMap, entities: Entity[]): ITurnResult[];
}
