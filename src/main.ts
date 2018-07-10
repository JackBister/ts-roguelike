import * as ROT from "rot-js"
import { Entity, entities } from "./Entity";
import { GameMap } from "./GameMap";
import { GameState } from "./GameState"
import { COLORS } from "./Colors";

const CONSOLE_HEIGHT = 50;
const CONSOLE_WIDTH = 80;

const MAP_HEIGHT = 45;
const MAP_WIDTH = 80;

let display: ROT.Display;
let fov: ROT.FOV = new ROT.FOV.PreciseShadowcasting(
    (x, y) => {
        if (x < 0 || x >= MAP_WIDTH
            || y < 0 || y >= MAP_HEIGHT) {
            return false;
        }
        return !map.getTile(x, y).blocksSight;
    }
);
let gameState: GameState = GameState.PLAYER_TURN;
let map: GameMap;
let player: Entity = { x: CONSOLE_WIDTH / 2, y: CONSOLE_HEIGHT / 2, symbol: "私", color: "white", name: "Player", isBlocking: true };

function entityTick() {
    for (let v of entities) {
        if (v != player) {
            console.log("The " + v.name + " ponders the meaning of its existence.");
        }
    }
    gameState = GameState.PLAYER_TURN;
}

function draw(display: ROT.Display) {
    display.clear();

    //Draw tiles that aren't currently in FOV
    for (let x = 0; x < MAP_WIDTH; ++x) {
        for (let y = 0; y < MAP_HEIGHT; ++y) {
            let tile = map.getTile(x, y);
            if (tile.isSeen) {
                if (tile.blocksSight) {
                    display.draw(x, y, "", null, COLORS.darkWall);
                } else {
                    display.draw(x, y, "", null, COLORS.darkGround);
                }
            }
        }
    }

    //Compute current FOV and draw
    fov.compute(player.x, player.y, 10, (x, y, r, vis) => {
        let tile = map.getTile(x, y);
        tile.isSeen = true;
        if (tile.blocksSight) {
            display.draw(x, y, "", null, COLORS.lightWall);
        } else {
            display.draw(x, y, "", null, COLORS.lightGround);
        }
        //TODO: Probably very slow with lots of entities + big rooms
        let visEnts = entities.filter(e => e.x == x && e.y == y);
        for (let v of visEnts) {
            display.draw(v.x, v.y, v.symbol, v.color, COLORS.lightGround);
        }
    });
}

export function main() {
    if (!ROT.isSupported()) {
        console.log("ERROR: ROT.js is not supported by this browser!");
        return;
    }
    let container = document.getElementById("app");

    display = new ROT.Display({ height: CONSOLE_HEIGHT, width: CONSOLE_WIDTH, forceSquareRatio: true, fontSize: 20 });
    container.appendChild(display.getContainer());

    entities.push(player);

    map = new GameMap({ height: MAP_HEIGHT, width: MAP_WIDTH, player: player });

    window.onkeydown = onKeyDown;

    draw(display);
}

function onKeyDown(evt: KeyboardEvent) {
    let code = evt.keyCode;

    if (code != ROT.VK_LEFT && code != ROT.VK_UP && code != ROT.VK_RIGHT && code != ROT.VK_DOWN) {
        return;
    }
    evt.preventDefault();

    if (gameState != GameState.PLAYER_TURN) {
        return;
    }

    let nextPos = {
        x: player.x,
        y: player.y
    };

    switch (code) {
        case ROT.VK_LEFT:
            nextPos.x--;
            break;
        case ROT.VK_UP:
            nextPos.y--;
            break;
        case ROT.VK_RIGHT:
            nextPos.x++;
            break;
        case ROT.VK_DOWN:
            nextPos.y++;
            break;
    }

    let targetEntity: Entity = null;
    {
        let targetEntities = entities.filter(e => e.x == nextPos.x && e.y == nextPos.y);
        if (targetEntities.length > 0) {
            targetEntity = targetEntities[0];
        }
    }

    if (targetEntity) {
        console.log("You kick the " + targetEntity.name + " in the shins, much to its annoyance!");
    }

    if (!map.isBlocked(nextPos.x, nextPos.y) && (!targetEntity || !targetEntity.isBlocking)) {
        player.x = nextPos.x;
        player.y = nextPos.y;
    }
    draw(display);

    gameState = GameState.ENEMY_TURN;
    entityTick();
}
