import * as ROT from "rot-js";
import { COLORS } from "./Colors";
import { killMonster, killPlayer } from "./deathFunctions";
import { Entity } from "./Entity";
import { Fighter } from "./Fighter";
import { IFightResult } from "./FightResult";
import { GameMap } from "./GameMap";
import { GameState } from "./GameState";
import { MessageLog } from "./MessageLog";
import { RenderOrder } from "./RenderOrder";
import { TutorialMapGenerator } from "./TutorialMapGenerator";

const BAR_WIDTH = 20;

const CONSOLE_HEIGHT = 50;
const CONSOLE_WIDTH = 80;

const MAP_HEIGHT = 43;
const MAP_WIDTH = 80;

const PANEL_HEIGHT = 7;
const PANEL_Y = CONSOLE_HEIGHT - PANEL_HEIGHT;

const MESSAGE_HEIGHT = PANEL_HEIGHT - 1;
const MESSAGE_WIDTH = CONSOLE_WIDTH - BAR_WIDTH - 2;
const MESSAGE_X = BAR_WIDTH + 2;

const PLAYER_FOV = 10;

const USED_KEYS = [
    ROT.VK_LEFT,
    ROT.VK_UP,
    ROT.VK_RIGHT,
    ROT.VK_DOWN,

    ROT.VK_H,
    ROT.VK_K,
    ROT.VK_L,
    ROT.VK_J,

    ROT.VK_Y,
    ROT.VK_U,
    ROT.VK_B,
    ROT.VK_N,
];

let con: ROT.Display;
const fov: ROT.FOV = new ROT.FOV.PreciseShadowcasting(
    (x, y) => {
        if (x < 0 || x >= MAP_WIDTH
            || y < 0 || y >= MAP_HEIGHT) {
            return false;
        }
        return !map.getTile(x, y).blocksSight;
    },
);
export let entities: Entity[] = [];
let gameState: GameState = GameState.PLAYER_TURN;
let lastPointedEntityName: string = "";
let map: GameMap;
const messageLog: MessageLog = new MessageLog(MESSAGE_X, MESSAGE_HEIGHT, MESSAGE_WIDTH);
let panel: ROT.Display;
const player: Entity = new Entity(
    CONSOLE_WIDTH,
    CONSOLE_HEIGHT,
    "white",
    "私",
    true,
    "Player",
    RenderOrder.ACTOR,
    new Fighter(30, 2, 5),
);

function addResultsToMessageLog(results: IFightResult[]) {
    for (const v of results) {
        if (v.message) {
            messageLog.addMessage(v.message);
        }

        if (v.dead) {
            let deathMessage = null;
            if (v.dead === player) {
                const res = killPlayer(v.dead);
                deathMessage = res.message;
                gameState = res.state;
            } else {
                const res = killMonster(v.dead);
                deathMessage = res.message;
            }

            messageLog.addMessage(deathMessage);
        }
    }
}

function entityTick() {
    if (gameState !== GameState.ENEMY_TURN) {
        return;
    }

    let results: IFightResult[] = [];
    for (const v of entities) {
        if (v.ai) {
            results = results.concat(v.ai.takeTurn(player, fov, map, entities));
        }
    }

    addResultsToMessageLog(results);

    draw(con, panel, player);

    gameState = GameState.PLAYER_TURN;
}

function draw(mainDisplay: ROT.Display, uiDisplay: ROT.Display, target: Entity) {
    drawCon(mainDisplay, target);
    drawPanel(uiDisplay, target, lastPointedEntityName);
}

function drawCon(display: ROT.Display, target: Entity) {
    display.clear();

    // Draw tiles that aren't currently in FOV
    for (let x = 0; x < MAP_WIDTH; ++x) {
        for (let y = 0; y < MAP_HEIGHT; ++y) {
            const tile = map.getTile(x, y);
            if (tile.isSeen) {
                if (tile.blocksSight) {
                    display.draw(x, y, "", null, COLORS.darkWall);
                } else {
                    display.draw(x, y, "", null, COLORS.darkGround);
                }
            }
        }
    }

    // Compute current FOV and draw
    fov.compute(target.x, target.y, PLAYER_FOV, (x, y, r, vis) => {
        const tile = map.getTile(x, y);
        tile.isSeen = true;
        if (tile.blocksSight) {
            display.draw(x, y, "", null, COLORS.lightWall);
        } else {
            display.draw(x, y, "", null, COLORS.lightGround);
        }
        // TODO: Probably very slow with lots of entities + big rooms
        const visEnts = entities.filter((e) => e.x === x && e.y === y).sort((e) => e.renderOrder);
        for (const v of visEnts) {
            display.draw(v.x, v.y, v.symbol, v.color, COLORS.lightGround);
        }
    });
}

function drawPanel(display: ROT.Display, target: Entity, pointedEntityName: string) {
    display.clear();

    drawBar(display, 1, 1, BAR_WIDTH, "HP", target.fighter.currHp, target.fighter.maxHp, "red", "darkred");
    drawMessageLog(display, messageLog);

    if (pointedEntityName) {
        display.drawText(1, 0, pointedEntityName);
    }
}

function drawBar(display: ROT.Display, x: number, y: number, totalWidth: number, name: string, value: number,
                 max: number, color: string, backColor: string) {
    const barWidth = Math.floor(value / max * totalWidth);

    for (let i = 0; i < totalWidth; ++i) {
        display.draw(
            x + i,
            y,
            "",
            null,
            i < barWidth ? color : backColor,
        );
    }

    const dispString = `${name}: ${value}/${max}`;

    display.drawText(
        Math.floor(x + totalWidth / 2 - dispString.length / 2),
        y,
        dispString,
    );
}

function drawMessageLog(display: ROT.Display, log: MessageLog) {
    let y = 1;
    for (const v of log.messages) {
        display.drawText(
            messageLog.x,
            y,
            v.text,
            messageLog.width,
        );
        y++;
    }
}

export function main() {
    if (!ROT.isSupported()) {
        throw new Error("ERROR: ROT.js is not supported by this browser!");
    }
    const container = document.getElementById("app");

    con = new ROT.Display({ height: CONSOLE_HEIGHT, width: CONSOLE_WIDTH, forceSquareRatio: true, fontSize: 20 });
    container.appendChild(con.getContainer());

    panel = new ROT.Display({ height: PANEL_HEIGHT, width: CONSOLE_WIDTH, forceSquareRatio: true, fontSize: 20 });
    container.appendChild(panel.getContainer());

    entities.push(player);

    map = new TutorialMapGenerator().generate({ height: MAP_HEIGHT, width: MAP_WIDTH, player }, entities);

    window.onkeydown = onKeyDown;

    window.onmousemove = onMouseMove;

    draw(con, panel, player);
}

function onKeyDown(evt: KeyboardEvent) {
    const code = evt.keyCode;

    if (USED_KEYS.indexOf(code) === -1) {
        return;
    }
    evt.preventDefault();

    if (gameState !== GameState.PLAYER_TURN) {
        return;
    }

    const nextPos = {
        x: player.x,
        y: player.y,
    };

    switch (code) {
        case ROT.VK_LEFT:
        case ROT.VK_H:
            nextPos.x--;
            break;
        case ROT.VK_UP:
        case ROT.VK_K:
            nextPos.y--;
            break;
        case ROT.VK_RIGHT:
        case ROT.VK_L:
            nextPos.x++;
            break;
        case ROT.VK_DOWN:
        case ROT.VK_J:
            nextPos.y++;
            break;
        case ROT.VK_Y:
            nextPos.x--;
            nextPos.y--;
            break;
        case ROT.VK_U:
            nextPos.x++;
            nextPos.y--;
            break;
        case ROT.VK_B:
            nextPos.x--;
            nextPos.y++;
            break;
        case ROT.VK_N:
            nextPos.x++;
            nextPos.y++;
            break;
    }

    if (player.fighter.currHp > 0) {
        let results: IFightResult[] = [];

        let targetEntity: Entity = null;
        {
            const targetEntities = entities.filter((e) => e.x === nextPos.x && e.y === nextPos.y);
            if (targetEntities.length > 0) {
                targetEntity = targetEntities[0];
            }
        }

        if (targetEntity) {
            results = results.concat(player.fighter.attack(targetEntity));
        }

        if (!map.isBlocked(nextPos.x, nextPos.y) && (!targetEntity || !targetEntity.isBlocking)) {
            player.x = nextPos.x;
            player.y = nextPos.y;
        }

        addResultsToMessageLog(results);
    }

    draw(con, panel, player);

    gameState = GameState.ENEMY_TURN;
    entityTick();
}

function onMouseMove(evt: MouseEvent) {
    const pos = con.eventToPosition(evt);

    if (typeof pos === "number") {
        return;
    }

    const filteredEnts = entities.filter((e) => e.x === pos[0] && e.y === pos[1]).sort((e) => e.renderOrder);

    let pointedEntName = "";
    if (filteredEnts.length > 0) {
        const pointedEnt = filteredEnts[filteredEnts.length - 1];
        fov.compute(player.x, player.y, PLAYER_FOV, (x, y) => {
            if (pointedEnt.x === x && pointedEnt.y === y) {
                pointedEntName = pointedEnt.name;
            }
        });
    }
    lastPointedEntityName = pointedEntName;
    drawPanel(panel, player, pointedEntName);
}
