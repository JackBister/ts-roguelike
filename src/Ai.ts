import * as ROT from "rot-js";

import { BasicMonsterAi } from "./BasicMonsterAi";
import { ConfusedMonsterAi } from "./ConfusedMonsterAi";
import { Entity } from "./Entity";
import { GameMap } from "./GameMap";
import { ITurnResult } from "./TurnResult";

export function aiFromObject(obj: any) {
    switch (obj._type) {
        case "BasicMonsterAi":
            return new BasicMonsterAi();
            break;
        case "ConfusedMonsterAi":
            return new ConfusedMonsterAi(obj.previousAi, obj.numTurns);
            break;
    }
    return null;
}

export interface IAi {
    owner: Entity;

    takeTurn(target: Entity, fov: ROT.FOV, map: GameMap, entities: Entity[]): ITurnResult[];
}
