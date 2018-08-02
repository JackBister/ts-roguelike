import { Component } from "./components/Component";
import { Entity } from "./Entity";
import { GameMap } from "./GameMap";
import { GameState } from "./GameState";
import { MessageLog } from "./MessageLog";

export interface ISavedGame {
    playerId: number;
    entities: Entity[];
    components: Component[];
    gameMaps: GameMap[];
    knownMapIds: number[];
    currentMapId: number;
    messageLog: MessageLog;
    gameState: GameState;
}

export function saveGame(playerId: number,
                         entities: Entity[],
                         components: Component[],
                         gameMaps: GameMap[],
                         knownMapIds: number[],
                         currentMapId: number,
                         messageLog: MessageLog,
                         gameState: GameState,
) {
    localStorage.setItem("savedGame", JSON.stringify({
        components,
        currentMapId,
        entities,
        gameMaps,
        gameState,
        knownMapIds,
        messageLog,
        playerId,
    }));
}
