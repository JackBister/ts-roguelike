import * as ROT from "rot-js"

import { Entity } from "./Entity";
import { GameMap } from "./GameMap";
import { FightResult } from "./FightResult";

export interface Ai {
    takeTurn(target: Entity, fov: ROT.FOV, map: GameMap, entities: Entity[]): FightResult[];

    owner: Entity;
}
