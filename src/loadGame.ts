
import { aiFromObject } from "./Ai";
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
    entities: Entity[];
    gameMaps: GameMap[];
    gameState: GameState;
    messageLog: MessageLog;
    player: Entity;
}

export function loadGame(savedGame: ISavedGame) {
    const ret: ILoadedGame = { entities: [], gameMaps: [], gameState: null, messageLog: null, player: null };
    for (const m of savedGame.gameMaps) {
        ret.gameMaps.push(GameMap.fromOtherMap(m));
    }
    ret.gameState = savedGame.gameState;
    ret.messageLog = MessageLog.fromOtherMessageLog(savedGame.messageLog);
    for (const e of savedGame.entities) {
        const ne = new Entity(
            e.x,
            e.y,
            e.color,
            e.symbol,
            e.isBlocking,
            e.name,
            e.renderOrder,
        );
        if (e.ai) {
            ne.ai = aiFromObject(e.ai);
            ne.ai.owner = ne;
        }
        if (e.fighter) {
            ne.fighter = fighterFromObject(e.fighter);
            ne.fighter.owner = ne;
        }
        if (e.inventory) {
            ne.inventory = inventoryFromObject(e.inventory);
            ne.inventory.owner = ne;
        }
        if (e.item) {
            ne.item = itemFromObject(e.item);
            ne.item.owner = ne;
        }
        if (e.stairs) {
            ne.stairs = new Stairs(e.stairs.floor);
            ne.stairs.owner = ne;
        }
        if (e.level) {
            ne.level = new Level(e.level.currentLevel, e.level.currentXp, e.level.levelUpBase, e.level.levelUpFactor);
            ne.level.owner = ne;
        }
        ret.entities.push(ne);
    }
    ret.player = ret.entities[savedGame.playerIndex];
    return ret;
}
