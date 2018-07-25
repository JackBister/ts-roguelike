import { Entity } from "./Entity";
import { GameMap } from "./GameMap";
import { GameState } from "./GameState";
import { MessageLog } from "./MessageLog";

export interface ISavedGame {
    currentMap: number;
    entities: Entity[];
    gameMaps: GameMap[];
    gameState: GameState;
    messageLog: MessageLog;
    playerIndex: number;
}

export function saveGame(player: Entity,
                         entities: Entity[],
                         gameMaps: GameMap[],
                         currentMap: number,
                         messageLog: MessageLog,
                         gameState: GameState) {
    localStorage.setItem("savedGame", JSON.stringify({
        currentMap: currentMap,
        entities: entities,
        gameMaps: gameMaps,
        gameState: gameState,
        messageLog: messageLog,
        playerIndex: entities.indexOf(player),
    }));
}
