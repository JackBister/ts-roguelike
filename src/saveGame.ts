import { Component } from "./components/Component";
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

export interface INewSavedGame {
    playerId: number;
    entities: Entity[];
    components: Component[];
    gameMaps: GameMap[];
    knownMapIds: number[];
    currentMapId: number;
    messageLog: MessageLog;
    gameState: GameState;
}

export function newSaveGame(playerId: number,
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
