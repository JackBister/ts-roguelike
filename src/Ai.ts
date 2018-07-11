import * as ROT from "rot-js";

import { Entity } from "./Entity";
import { IFightResult } from "./FightResult";
import { GameMap } from "./GameMap";

export interface IAi {
    owner: Entity;

    takeTurn(target: Entity, fov: ROT.FOV, map: GameMap, entities: Entity[]): IFightResult[];
}
