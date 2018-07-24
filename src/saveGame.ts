import { Entity } from "./Entity";
import { GameMap } from "./GameMap";
import { GameState } from "./GameState";
import { MessageLog } from "./MessageLog";

export interface ISavedGame {
    entities: Entity[];
    gameMaps: GameMap[];
    gameState: GameState;
    messageLog: MessageLog;
    playerIndex: number;
}

export function saveGame(player: Entity,
                         entities: Entity[],
                         gameMaps: GameMap[],
                         messageLog: MessageLog,
                         gameState: GameState) {
    localStorage.setItem("savedGame", JSON.stringify({
        entities: entities,
        gameMaps: gameMaps,
        gameState: gameState,
        messageLog: messageLog,
        playerIndex: entities.indexOf(player),
    }));
}
