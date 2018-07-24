import { Entity } from "./Entity";
import { GameMap } from "./GameMap";
import { GameState } from "./GameState";
import { MessageLog } from "./MessageLog";

export interface ISavedGame {
    entities: Entity[];
    gameMap: GameMap;
    gameState: GameState;
    messageLog: MessageLog;
    playerIndex: number;
}

export function saveGame(player: Entity,
                         entities: Entity[],
                         gameMap: GameMap,
                         messageLog: MessageLog,
                         gameState: GameState) {
    localStorage.setItem("savedGame", JSON.stringify({
        entities: entities,
        gameMap: gameMap,
        gameState: gameState,
        messageLog: messageLog,
        playerIndex: entities.indexOf(player),
    }));
}
