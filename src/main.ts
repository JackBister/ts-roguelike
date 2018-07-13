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
const entities: Entity[] = [];
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

function calculateCanvasSizes(mainDisplay: ROT.Display, panelDisplay: ROT.Display) {
    const htmlBody = document.querySelector("body");
    htmlBody.style.height = window.innerHeight + "px";
    htmlBody.style.widows = window.innerWidth + "px";

    const grid = document.getElementById("grid");
    if (navigator &&
        (navigator.maxTouchPoints > 0
            || navigator.msMaxTouchPoints > 0
            || /iPad|iPhone|iPod/.test(navigator.platform))) {
        grid.style.display = "grid";
    } else {
        grid.style.display = "none";
    }

    const [mainWidth, mainHeight] = mainDisplay.computeSize(
        window.innerWidth,
        Math.floor(window.innerHeight * CONSOLE_HEIGHT / (CONSOLE_HEIGHT + PANEL_HEIGHT)),
    );

    mainDisplay.setOptions({ height: mainHeight, width: mainWidth });

    const [panelWidth, panelHeight] = mainDisplay.computeSize(
        window.innerWidth,
        Math.ceil(window.innerHeight * PANEL_HEIGHT / (CONSOLE_HEIGHT + PANEL_HEIGHT)),
    );

    panelDisplay.setOptions({ height: panelHeight, width: panelWidth });
}

function draw(mainDisplay: ROT.Display, uiDisplay: ROT.Display, target: Entity) {
    drawCon(mainDisplay, target);
    drawPanel(uiDisplay, target, lastPointedEntityName);
}

function drawCon(display: ROT.Display, target: Entity) {
    display.clear();

    const mapX0 = target.x;
    const mapY0 = target.y;

    const conX0 = Math.floor(display.getOptions().width / 2);
    const conY0 = Math.floor(display.getOptions().height / 2);

    // Draw tiles that aren't currently in FOV
    for (let x = 0; x < MAP_WIDTH; ++x) {
        for (let y = 0; y < MAP_HEIGHT; ++y) {
            const finalPosX = x - mapX0 + conX0;
            const finalPosY = y - mapY0 + conY0;
            const tile = map.getTile(x, y);
            if (tile.isSeen) {
                if (tile.blocksSight) {
                    display.draw(finalPosX, finalPosY, "", null, COLORS.darkWall);
                } else {
                    display.draw(finalPosX, finalPosY, "", null, COLORS.darkGround);
                }
            }
        }
    }

    // Compute current FOV and draw
    fov.compute(target.x, target.y, PLAYER_FOV, (x, y, r, vis) => {
        const finalPosX = x - mapX0 + conX0;
        const finalPosY = y - mapY0 + conY0;
        const tile = map.getTile(x, y);
        tile.isSeen = true;
        if (tile.blocksSight) {
            display.draw(finalPosX, finalPosY, "", null, COLORS.lightWall);
        } else {
            display.draw(finalPosX, finalPosY, "", null, COLORS.lightGround);
        }
        // TODO: Probably very slow with lots of entities + big rooms
        const visEnts = entities
            .filter((e) => e.x === x && e.y === y)
            .sort((e) => {
                return e.renderOrder;
            });
        if (visEnts.length > 0) {
            const e = visEnts[visEnts.length - 1];
            display.draw(finalPosX, finalPosY, e.symbol, e.color, COLORS.lightGround);
        }
    });

    // HACK: Redraw the player. Normally the FOV stuff above should work,
    // but it doesn't on iOS (player gets drawn beneath corpses) and I don't see why.
    display.draw(conX0, conY0, target.symbol, target.color, COLORS.lightGround);
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

    gameState = GameState.PLAYER_TURN;

    addResultsToMessageLog(results);

    draw(con, panel, player);
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

    calculateCanvasSizes(con, panel);

    entities.push(player);

    map = new TutorialMapGenerator().generate({ height: MAP_HEIGHT, width: MAP_WIDTH }, player, entities);

    window.onkeydown = onKeyDown;

    window.onmousemove = onMouseMove;

    window.onresize = () => {
        calculateCanvasSizes(con, panel);
        draw(con, panel, player);
    };

    window.ontouchstart = onTouchStart;
    window.ontouchend = (evt) => evt.preventDefault();

    draw(con, panel, player);
}

function onKeyDown(evt: KeyboardEvent) {
    const code = evt.keyCode;

    if (USED_KEYS.indexOf(code) === -1) {
        return;
    }
    evt.preventDefault();

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

    playerTick(nextPos);
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

function onTouchStart(evt: TouchEvent) {
    evt.preventDefault();
    if (evt.touches && evt.touches.length > 0) {
        const touch = evt.touches[0];
        const nextPos = {
            x: player.x,
            y: player.y,
        };

        if (touch.clientX < window.innerWidth / 3) {
            nextPos.x--;
        } else if (touch.clientX > window.innerWidth / 3 * 2) {
            nextPos.x++;
        }

        if (touch.clientY < window.innerHeight / 3) {
            nextPos.y--;
        } else if (touch.clientY > window.innerHeight / 3 * 2) {
            nextPos.y++;
        }

        if (nextPos.x !== player.x || nextPos.y !== player.y) {
            playerTick(nextPos);
        }
    }
}

function playerTick(nextPos: { x: number, y: number }) {
    if (gameState !== GameState.PLAYER_TURN) {
        return;
    }
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

    gameState = GameState.ENEMY_TURN;

    addResultsToMessageLog(results);

    draw(con, panel, player);

    entityTick();
}
