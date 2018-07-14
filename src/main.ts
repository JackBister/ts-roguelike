import * as ROT from "rot-js";
import { IAction } from "./Action";
import { COLORS } from "./Colors";
import { killMonster, killPlayer } from "./deathFunctions";
import { Entity } from "./Entity";
import { Fighter } from "./Fighter";
import { GameMap } from "./GameMap";
import { GameState } from "./GameState";
import { Inventory } from "./Inventory";
import { menu } from "./menuFunctions";
import { Message } from "./Message";
import { MessageLog } from "./MessageLog";
import { RenderOrder } from "./RenderOrder";
import { ITurnResult } from "./TurnResult";
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

    ROT.VK_G,
    ROT.VK_I,

    ROT.VK_D,

    ROT.VK_ESCAPE,
    ROT.VK_RETURN,
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
let inventorySelection = 0;
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
    null,
    null,
    new Inventory(26),
);
let previousGameState: GameState = null;

function addResultsToMessageLog(results: ITurnResult[]) {
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

        if (v.itemAdded) {
            entities.splice(entities.indexOf(v.itemAdded), 1);
        }

        if (v.itemDropped) {
            entities.push(v.itemDropped);
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

    const conHeight = Math.floor(window.innerHeight * CONSOLE_HEIGHT / (CONSOLE_HEIGHT + PANEL_HEIGHT));

    const [mainWidth, mainHeight] = mainDisplay.computeSize(
        window.innerWidth,
        conHeight,
    );

    mainDisplay.setOptions({ height: mainHeight, width: mainWidth });

    const [panelWidth, panelHeight] = mainDisplay.computeSize(
        window.innerWidth,
        window.innerHeight - conHeight,
    );

    panelDisplay.setOptions({ height: panelHeight, width: panelWidth });

    messageLog.height = panelHeight - 1;
}

function draw(mainDisplay: ROT.Display, uiDisplay: ROT.Display, target: Entity) {
    drawCon(mainDisplay, target);
    if (gameState === GameState.SHOW_INVENTORY) {
        menu(mainDisplay,
            "Inventory",
            player.inventory.items.map((i) => i.name),
            inventorySelection,
            50,
            CONSOLE_WIDTH,
            CONSOLE_HEIGHT);
    }
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

    let results: ITurnResult[] = [];
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

    let action: IAction = null;

    switch (code) {
        case ROT.VK_LEFT:
        case ROT.VK_H:
            action = { type: "move", to: [player.x - 1, player.y] };
            break;
        case ROT.VK_UP:
        case ROT.VK_K:
            action = { type: "move", to: [player.x, player.y - 1] };
            break;
        case ROT.VK_RIGHT:
        case ROT.VK_L:
            action = { type: "move", to: [player.x + 1, player.y] };
            break;
        case ROT.VK_DOWN:
        case ROT.VK_J:
            action = { type: "move", to: [player.x, player.y + 1] };
            break;
        case ROT.VK_Y:
            action = { type: "move", to: [player.x - 1, player.y - 1] };
            break;
        case ROT.VK_U:
            action = { type: "move", to: [player.x + 1, player.y - 1] };
            break;
        case ROT.VK_B:
            action = { type: "move", to: [player.x - 1, player.y + 1] };
            break;
        case ROT.VK_N:
            action = { type: "move", to: [player.x + 1, player.y + 1] };
            break;
        case ROT.VK_G:
            action = { type: "pickup" };
            break;
        case ROT.VK_I:
            action = { type: "open-inventory" };
            break;
        case ROT.VK_D:
            action = { type: "drop" };
            break;
        case ROT.VK_ESCAPE:
            action = { type: "exit" };
            break;
        case ROT.VK_RETURN:
            action = { type: "enter" };
            break;
    }

    playerTick(action);
}

function onMouseMove(evt: MouseEvent) {
    const pos = con.eventToPosition(evt);

    if (typeof pos === "number") {
        return;
    }
    const conX0 = Math.floor(con.getOptions().width / 2);
    const conY0 = Math.floor(con.getOptions().height / 2);

    const filteredEnts = entities
        .filter((e) => {
            const finalPosX = e.x - player.x + conX0;
            const finalPosY = e.y - player.y + conY0;
            return finalPosX === pos[0] && finalPosY === pos[1];
        }).sort((e) => e.renderOrder);

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

        let action: IAction = null;
        let isMove = false;
        const to: [number, number] = [player.x, player.y];

        if (touch.clientX < window.innerWidth / 3) {
            isMove = true;
            to[0]--;
        } else if (touch.clientX > window.innerWidth / 3 * 2) {
            isMove = true;
            to[0]++;
        }

        if (touch.clientY < window.innerHeight / 3) {
            isMove = true;
            to[1]--;
        } else if (touch.clientY > window.innerHeight / 3 * 2) {
            isMove = true;
            to[1]++;
        }

        if (isMove) {
            if (gameState === GameState.SHOW_INVENTORY && to[0] === player.x - 1 && to[1] === player.y - 1) {
                action = { type: "exit" };
            } else {
                action = { type: "move", to: to };
            }
        } else if (entities.some((e) => e.item && e.x === player.x && e.y === player.y)) {
            action = { type: "pickup" };
        } else {
            if (gameState === GameState.SHOW_INVENTORY) {
                action = { type: "enter" };
            } else {
                action = { type: "open-inventory" };
            }
        }

        if (action) {
            playerTick(action);
        }
    }
}

function playerTick(action: IAction) {
    if (gameState === GameState.ENEMY_TURN) {
        return;
    }
    let results: ITurnResult[] = [];

    if (gameState === GameState.PLAYER_TURN) {
        if (action.type === "move") {
            let targetEntity: Entity = null;
            {
                const targetEntities = entities.filter((e) => e.x === action.to[0] && e.y === action.to[1]);
                if (targetEntities.length > 0) {
                    targetEntity = targetEntities[0];
                }
            }

            if (targetEntity) {
                results = results.concat(player.fighter.attack(targetEntity));
            }

            if (!map.isBlocked(action.to[0], action.to[1]) && (!targetEntity || !targetEntity.isBlocking)) {
                player.x = action.to[0];
                player.y = action.to[1];
            }

            gameState = GameState.ENEMY_TURN;
        } else if (action.type === "pickup") {
            const pickedUpEntity = entities.filter((e) => e.item && e.x === player.x && e.y === player.y);
            if (pickedUpEntity.length > 0) {
                results = results.concat(player.inventory.addItem(pickedUpEntity[0].item));
            } else {
                messageLog.addMessage(new Message("There is nothing here to pick up.", "yellow"));
            }
            gameState = GameState.ENEMY_TURN;
        } else if (action.type === "open-inventory") {
            previousGameState = gameState;
            inventorySelection = 0;
            gameState = GameState.SHOW_INVENTORY;
        }
    } else if (gameState === GameState.PLAYER_DEAD) {
        if (action.type === "open-inventory") {
            previousGameState = gameState;
            inventorySelection = 0;
            gameState = GameState.SHOW_INVENTORY;
        }
    } else if (gameState === GameState.SHOW_INVENTORY) {
        if (action.type === "exit") {
            gameState = previousGameState;
        } else if (action.type === "move") {
            if (action.to[1] === player.y + 1 && inventorySelection < player.inventory.items.length - 1) {
                inventorySelection++;
            } else if (action.to[1] === player.y - 1 && inventorySelection > 0) {
                inventorySelection--;
            }
        } else if (action.type === "enter") {
            results = results.concat(player.inventory.useItem(inventorySelection, entities));
        } else if (action.type === "drop") {
            results = results.concat(player.inventory.dropItem(inventorySelection, entities));
        }
    }

    addResultsToMessageLog(results);

    draw(con, panel, player);

    entityTick();
}
