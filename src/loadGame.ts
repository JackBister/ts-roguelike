
import { Entity } from "./Entity";
import { fighterFromObject } from "./Fighter";
import { GameMap } from "./GameMap";
import { GameState } from "./GameState";
import { inventoryFromObject } from "./Inventory";
import { itemFromObject } from "./Item";
import { Level } from "./Level";
import { MessageLog } from "./MessageLog";
import { ISavedGame } from "./saveGame";
import { Stairs } from "./Stairs";

interface ILoadedGame {
    currentMap: number;
    entities: Entity[];
    gameMaps: GameMap[];
    gameState: GameState;
    messageLog: MessageLog;
    player: Entity;
}

export function loadGame(savedGame: ISavedGame) {
    const ret: ILoadedGame = {
        currentMap: savedGame.currentMap,
        entities: [],
        gameMaps: [],
        gameState: null,
        messageLog: null,
        player: null,
    };
    for (const m of savedGame.gameMaps) {
        ret.gameMaps.push(GameMap.fromOtherMap(m));
    }
    ret.gameState = savedGame.gameState;
    ret.messageLog = MessageLog.fromOtherMessageLog(savedGame.messageLog);
    ret.entities = savedGame.entities;
    ret.player = ret.entities[savedGame.playerIndex];
    return ret;
}
