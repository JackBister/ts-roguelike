import * as ROT from "rot-js";
import { IAction } from "./Action";
import { characterScreen } from "./characterScreen";
import { COLORS } from "./Colors";
import { ComponentService } from "./components/Component.service";
import { EquipmentComponent } from "./components/EquipmentComponent";
import { FighterComponent } from "./components/FighterComponent";
import { InventoryComponent } from "./components/InventoryComponent";
import { LevelComponent } from "./components/LevelComponent";
import { container } from "./config/container";
import { killMonster, killPlayer } from "./deathFunctions";
import { drawTouchIcons } from "./drawTouchIcons";
import { EntityService } from "./entities/Entity.service";
import { Entity } from "./Entity";
import { EventResult } from "./EventResult";
import { AttackEvent } from "./events/AttackEvent";
import { DropEvent } from "./events/DropEvent";
import { EnterEvent } from "./events/EnterEvent";
import { GainXpEvent } from "./events/GainXpEvent";
import { GetPropertyEvent } from "./events/GetPropertyEvent";
import { PickupEvent } from "./events/PickupEvent";
import { ThinkEvent } from "./events/ThinkEvent";
import { UseEvent } from "./events/UseEvent";
import { GameState } from "./GameState";
import { getFighterStats } from "./getFighterStats";
import { loadGame } from "./loadGame";
import { menu } from "./menuFunctions";
import { Message } from "./Message";
import { MessageLog } from "./MessageLog";
import { RenderOrder } from "./RenderOrder";
import { ISavedGame, saveGame } from "./saveGame";
import { FovService } from "./services/Fov.service";
import { MapService } from "./services/Map.service";
import { sumPropertyEvents } from "./sumPropertyEvents";
import { SystemService } from "./systems/System.service";
import { TutorialMapGenerator } from "./TutorialMapGenerator";

// TODO: Ugly hack!!!!
import "./services/usefunctions";

export const CONSTANTS = {
    BAR_WIDTH: 20,

    MAP_HEIGHT: 43,
    MAP_WIDTH: 80,

    MESSAGE_HEIGHT: 6,
    MESSAGE_WIDTH: 58,
    MESSAGE_X: 22,

    PANEL_HEIGHT: 7,
    PLAYER_FOV: 10,

    SCREEN_HEIGHT: 50,
    SCREEN_WIDTH: 80,

    // If a direction is held in touch mode, the player will move every TOUCH_MOVE_REPEAT_DELAY ms
    TOUCH_MOVE_REPEAT_DELAY: 300,
};

const MAIN_MENU_OPTIONS = [
    "Load Game",
    "New Game",
];

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
    ROT.VK_C,
    ROT.VK_Z,

    ROT.VK_ESCAPE,
    ROT.VK_RETURN,
];

let con: ROT.Display;
/*
const fov: ROT.FOV = new ROT.FOV.PreciseShadowcasting(
    (x, y) => {
        if (x < 0 || x >= CONSTANTS.MAP_WIDTH
            || y < 0 || y >= CONSTANTS.MAP_HEIGHT) {
            return false;
        }
        return !maps[currentMap].getTile(x, y).blocksSight;
    },
);

let currentMap = 0;
*/
// let entities: Entity[] = [];
let gameState: GameState = GameState.MAIN_MENU;
const knownMaps = [0];
let lastPointedEntityName: string = "";
// let maps: GameMap[] = [];
let menuSelection = 0;
let messageLog: MessageLog = new MessageLog(CONSTANTS.MESSAGE_X, CONSTANTS.MESSAGE_HEIGHT, CONSTANTS.MESSAGE_WIDTH);
let panel: ROT.Display;
let player: Entity = null;
let previousGameState: GameState = null;
let targetTile: [number, number];
let touchMoveRepeater: number;
let isTouchDevice = false;

const componentService = container.get<ComponentService>("ComponentService");
const entityService = container.get<EntityService>("EntityService");
const fovService = container.get<FovService>("FovService");
const mapService = container.get<MapService>("MapService");
const systemService = container.get<SystemService>("SystemService");

function addResultsToMessageLog(results: EventResult[]) {
    for (const v of results) {
        if (v.type === "message") {
            messageLog.addMessage(v.message);
        }

        if (v.type === "dead") {
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

        if (v.type === "dequipped") {
            const dequipped = entityService.getEntityById(v.dequipped);
            messageLog.addMessage(new Message(`You unequip the ${dequipped.name}.`, "white"));
        }
        if (v.type === "equipped") {
            const equipped = entityService.getEntityById(v.equipped);
            messageLog.addMessage(new Message(`You equip the ${equipped.name}.`, "white"));
        }

        if (v.type === "itemAdded") {
            const item = entityService.getEntityById(v.itemAdded);
            item.isActive = false;
        }

        if (v.type === "itemDropped") {
            const item = entityService.getEntityById(v.itemDropped);
            item.isActive = false;
        }

        if (v.type === "stairsEntered") {
            // TODO: ?
            if (!knownMaps.includes(v.newMapId)) {
                mapService.addMap(new TutorialMapGenerator(entityService, componentService, mapService).generate(
                    {
                        height: CONSTANTS.MAP_HEIGHT,
                        width: CONSTANTS.MAP_WIDTH,
                    },
                    v.newMapId,
                    entityService.getMaxEntityId() + 1,
                    player,
                    mapService.getCurrentMap().dungeonLevel + 1,
                ));

                const playerFighter = componentService
                    .getComponentByEntityIdAndType(player.id, "FighterComponent") as FighterComponent;

                const maxHp = sumPropertyEvents(
                    systemService.dispatchEvent(player.id, new GetPropertyEvent("maxHp")),
                );
                playerFighter.currHp += maxHp / 2;
                if (playerFighter.currHp > maxHp) {
                    playerFighter.currHp = maxHp;
                }
                messageLog.addMessage(
                    new Message("You rest for a moment, recovering your health.", "violet"),
                );

                knownMaps.push(v.newMapId);
            }

            mapService.setCurrentMap(v.newMapId);
            entityService.entities.forEach((e) => {
                if (e.mapId !== v.newMapId) {
                    e.isActive = false;
                }
            });
        }

        if (v.type === "targeting") {
            previousGameState = GameState.PLAYER_TURN;
            gameState = GameState.TARGETING;

            targetTile = [player.x, player.y];
        }

        if (v.type === "xp") {
            messageLog.addMessage(
                new Message(`You gain ${v.xp} experience points.`, "white"),
            );

            const xpResult = systemService.dispatchEvent(player.id, new GainXpEvent(v.xp));

            if (xpResult.some((r) => r.type === "leveledUp")) {

                messageLog.addMessage(
                    new Message("You have leveled up!", "yellow"),
                );
                previousGameState = gameState;
                gameState = GameState.LEVEL_UP;
                menuSelection = 0;
            }
        }
    }
}

function calculateCanvasSizes(mainDisplay: ROT.Display, panelDisplay: ROT.Display) {
    const htmlBody = document.querySelector("body");
    htmlBody.style.height = window.innerHeight + "px";
    htmlBody.style.widows = window.innerWidth + "px";

    const grid = document.getElementById("grid");
    const touchIcons = document.getElementById("touch-icons");
    if (navigator &&
        (navigator.maxTouchPoints > 0
            || navigator.msMaxTouchPoints > 0
            || /iPad|iPhone|iPod/.test(navigator.platform))
    ) {
        isTouchDevice = true;
        grid.style.display = "grid";
        touchIcons.style.display = "block";
    } else {
        isTouchDevice = false;
        grid.style.display = "none";
        touchIcons.style.display = "none";
    }

    const conHeight = Math.floor(
        window.innerHeight * CONSTANTS.SCREEN_HEIGHT / (CONSTANTS.SCREEN_HEIGHT + CONSTANTS.PANEL_HEIGHT));

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
    if (isTouchDevice) {
        drawTouchIcons(gameState, player, playerTick);
    }
    if (gameState === GameState.MAIN_MENU) {
        mainDisplay.clear();
        uiDisplay.clear();
        menu(mainDisplay,
            "Main Menu",
            MAIN_MENU_OPTIONS,
            menuSelection,
            CONSTANTS.SCREEN_WIDTH,
            CONSTANTS.SCREEN_WIDTH,
            CONSTANTS.SCREEN_HEIGHT,
        );
        return;
    }
    drawCon(mainDisplay, target);
    if (gameState === GameState.LEVEL_UP) {
        const { maxHp, power, defense } = getFighterStats(player.id);
        menu(mainDisplay,
            "Level up! Choose a stat to raise:",
            [
                `HP +20 (current: ${maxHp})`,
                `Attack +1 (current: ${power})`,
                `Defense +1 (current: ${defense})`,
            ],
            menuSelection,
            40,
            CONSTANTS.SCREEN_WIDTH,
            CONSTANTS.SCREEN_HEIGHT);
    } else if (gameState === GameState.SHOW_CHARACTER_PANEL) {
        characterScreen(mainDisplay,
            player,
            50,
            CONSTANTS.SCREEN_WIDTH,
            CONSTANTS.SCREEN_HEIGHT);
    } else if (gameState === GameState.SHOW_INVENTORY) {
        const playerInventory = componentService
            .getComponentByEntityIdAndType(player.id, "InventoryComponent") as InventoryComponent;
        const playerInventoryEntities = playerInventory.items
            .map((eid) => entityService.getEntityById(eid));
        menu(mainDisplay,
            "Inventory",
            playerInventoryEntities
                .map((i) => {
                    // TODO: Show if equipped (EventResult)
                    /*
                    if (i.equippable && player.equipment.equipped.includes(i.equippable)) {
                        return i.name + ` (on ${EQUIPMENTSLOTSTRINGS[i.equippable.slot]})`;
                    }
                    */
                    return i.name;
                }),
            menuSelection,
            50,
            CONSTANTS.SCREEN_WIDTH,
            CONSTANTS.SCREEN_HEIGHT);
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
    for (let x = 0; x < CONSTANTS.MAP_WIDTH; ++x) {
        for (let y = 0; y < CONSTANTS.MAP_HEIGHT; ++y) {
            const finalPosX = x - mapX0 + conX0;
            const finalPosY = y - mapY0 + conY0;
            const tile = mapService.getCurrentMap().getTile(x, y);
            if (tile.isSeen) {
                if (tile.blocksSight) {
                    display.draw(finalPosX, finalPosY, "", null, COLORS.darkWall);
                } else {
                    display.draw(finalPosX, finalPosY, "", null, COLORS.darkGround);
                }
            }
        }
    }

    const visibleCoordinates: Array<[number, number]> = [];

    // Compute current FOV and draw
    fovService.computeFov(target.x, target.y, CONSTANTS.PLAYER_FOV, (x, y) => {
        visibleCoordinates.push([x, y]);
        const finalPosX = x - mapX0 + conX0;
        const finalPosY = y - mapY0 + conY0;
        const tile = mapService.getCurrentMap().getTile(x, y);
        tile.isSeen = true;
        if (tile.blocksSight) {
            display.draw(finalPosX, finalPosY, "", null, COLORS.lightWall);
        } else if (gameState === GameState.TARGETING && targetTile[0] === x && targetTile[1] === y) {
            display.draw(finalPosX, finalPosY, "", null, "red");
        } else {
            display.draw(finalPosX, finalPosY, "", null, COLORS.lightGround);
        }
        // TODO: Probably very slow with lots of entities + big rooms
        const visEnts = entityService.getEntitiesAtPos(x, y)
            .filter((e) => e.isActive)
            .sort((e) => e.renderOrder);
        if (visEnts.length > 0) {
            const e = visEnts[visEnts.length - 1];
            if (gameState === GameState.TARGETING && targetTile[0] === x && targetTile[1] === y) {
                display.draw(finalPosX, finalPosY, e.symbol, e.color, "red");
            } else {
                display.draw(finalPosX, finalPosY, e.symbol, e.color, COLORS.lightGround);
            }
        }
    });

    entityService.entities
        .filter((e) => componentService.entityHasComponentOfType(e.id, "StairComponent"))
        .forEach((e) => {
            const finalPosX = e.x - mapX0 + conX0;
            const finalPosY = e.y - mapY0 + conY0;
            const tile = mapService.getCurrentMap().getTile(e.x, e.y);
            if (tile.isSeen) {
                if (!visibleCoordinates.some((v) => v[0] === e.x && v[1] === e.y)) {
                    display.draw(finalPosX, finalPosY, e.symbol, e.color, COLORS.darkGround);
                }
            }
        });

    // HACK: Redraw the player. Normally the FOV stuff above should work,
    // but it doesn't on iOS (player gets drawn beneath corpses) and I don't see why.
    display.draw(conX0, conY0, target.symbol, target.color, COLORS.lightGround);
}

function drawPanel(display: ROT.Display, target: Entity, pointedEntityName: string) {
    display.clear();

    if (target) {
        const targetFighter =
            componentService.getComponentByEntityIdAndType(target.id, "FighterComponent") as FighterComponent;
        drawBar(display,
            1,
            1,
            CONSTANTS.BAR_WIDTH,
            "HP",
            targetFighter.currHp,
            // TODO: proper calculation
            targetFighter.baseMaxHp,
            // Fighter.getMaxHp(target.fighter),
            "red",
            "darkred");
    }
    drawMessageLog(display, messageLog);

    if (pointedEntityName) {
        display.drawText(1, 0, pointedEntityName);
    }

    display.drawText(1, 2, `Floor: ${mapService.getCurrentMap().dungeonLevel}`);
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
            `%c{${v.color}}${v.text}`,
            messageLog.width,
        );
        y++;
    }
}

function entityTick() {
    if (gameState !== GameState.ENEMY_TURN) {
        return;
    }

    let results: EventResult[] = [];
    for (const v of entityService.entities.filter((e) => e.isActive)) {
        results = results.concat(systemService.dispatchEvent(v.id, new ThinkEvent()));
        /*
        if (v.ai) {
            results = results.concat(v.ai.takeTurn(player, fov, maps[currentMap], entities));
        }
        */
    }

    gameState = GameState.PLAYER_TURN;

    addResultsToMessageLog(results);

    draw(con, panel, player);
}

export function main() {
    if (!ROT.isSupported()) {
        throw new Error("ERROR: ROT.js is not supported by this browser!");
    }
    const appContainer = document.getElementById("app");

    con = new ROT.Display({
        fontSize: 20,
        forceSquareRatio: true,
        height: CONSTANTS.SCREEN_HEIGHT,
        width: CONSTANTS.SCREEN_WIDTH,
    });
    appContainer.appendChild(con.getContainer());

    panel = new ROT.Display({
        fontSize: 20,
        forceSquareRatio: true,
        height: CONSTANTS.PANEL_HEIGHT,
        width: CONSTANTS.SCREEN_WIDTH,
    });
    appContainer.appendChild(panel.getContainer());

    calculateCanvasSizes(con, panel);

    window.onkeydown = onKeyDown;

    window.onmousemove = onMouseMove;

    window.onresize = () => {
        calculateCanvasSizes(con, panel);
        draw(con, panel, player);
    };

    const touchIcons = document.getElementById("touch-icons");
    touchIcons.ontouchstart = (evt) => evt.stopPropagation();

    window.ontouchstart = onTouchStart;
    window.ontouchend = (evt) => {
        evt.preventDefault();
        if (touchMoveRepeater) {
            window.clearInterval(touchMoveRepeater);
            touchMoveRepeater = null;
        }
    };

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
            action = { type: "move", dir: [-1, 0] };
            break;
        case ROT.VK_UP:
        case ROT.VK_K:
            action = { type: "move", dir: [0, -1] };
            break;
        case ROT.VK_RIGHT:
        case ROT.VK_L:
            action = { type: "move", dir: [1, 0] };
            break;
        case ROT.VK_DOWN:
        case ROT.VK_J:
            action = { type: "move", dir: [0, 1] };
            break;
        case ROT.VK_Y:
            action = { type: "move", dir: [-1, -1] };
            break;
        case ROT.VK_U:
            action = { type: "move", dir: [1, -1] };
            break;
        case ROT.VK_B:
            action = { type: "move", dir: [-1, 1] };
            break;
        case ROT.VK_N:
            action = { type: "move", dir: [1, 1] };
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
        case ROT.VK_C:
            action = { type: "open-character-panel" };
            break;
        case ROT.VK_Z:
            action = { type: "wait" };
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

    const filteredEnts = entityService.entities
        .filter((e) => {
            const finalPosX = e.x - player.x + conX0;
            const finalPosY = e.y - player.y + conY0;
            return e.isActive && finalPosX === pos[0] && finalPosY === pos[1];
        })
        .sort((e) => e.renderOrder);

    let pointedEntName = "";
    if (filteredEnts.length > 0) {
        const pointedEnt = filteredEnts[filteredEnts.length - 1];
        fovService.computeFov(player.x, player.y, CONSTANTS.PLAYER_FOV, (x, y) => {
            if (pointedEnt.x === x && pointedEnt.y === y) {
                pointedEntName = pointedEnt.name;
            }
        });
    }
    lastPointedEntityName = pointedEntName;
    if (gameState !== GameState.MAIN_MENU) {
        drawPanel(panel, player, pointedEntName);
    }
}

function onTouchStart(evt: TouchEvent) {
    evt.preventDefault();
    if (evt.touches && evt.touches.length > 0) {
        const touch = evt.touches[0];

        let action: IAction = null;
        let isMove = false;
        const to: [number, number] = [0, 0];

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
            action = { type: "move", dir: to };
            if (touchMoveRepeater) {
                window.clearInterval(touchMoveRepeater);
                touchMoveRepeater = null;
            }
            touchMoveRepeater = window.setInterval(() => {
                playerTick(action);
            }
                , CONSTANTS.TOUCH_MOVE_REPEAT_DELAY,
            );
        } else if (entityService.entities.some
            ((e) => e.isActive
                && e.x === player.x
                && e.y === player.y
                && componentService.entityHasComponentOfType(e.id, "PickupableComponent"),
        )
        ) {
            action = { type: "pickup" };
        } else {
            if (gameState === GameState.MAIN_MENU
                || gameState === GameState.SHOW_INVENTORY
                || gameState === GameState.TARGETING
                || gameState === GameState.LEVEL_UP
                || entityService.entities.some(
                    (e) => e.isActive
                        && e.x === player.x
                        && e.y === player.y
                        && componentService.entityHasComponentOfType(e.id, "StairComponent"))
            ) {
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
    let results: EventResult[] = [];

    if (gameState === GameState.LEVEL_UP) {
        if (action.type === "move") {
            menuSelection += action.dir[1];
            if (menuSelection < 0) {
                menuSelection = 0;
            } else if (menuSelection >= 3) {
                menuSelection = 2;
            }
        } else if (action.type === "enter") {
            const playerFighter = componentService
                .getComponentByEntityIdAndType(player.id, "FighterComponent") as FighterComponent;
            if (menuSelection === 0) {
                playerFighter.baseMaxHp += 20;
                playerFighter.currHp += 20;
            } else if (menuSelection === 1) {
                playerFighter.basePower += 1;
            } else if (menuSelection === 2) {
                playerFighter.baseDefense += 1;
            }
            // HACK: Using previousState seems to get into some edge case where
            // if you level up from killing an enemy from the inventory you can't close the inventory.
            gameState = GameState.PLAYER_TURN;
        }
    } else if (gameState === GameState.MAIN_MENU) {
        if (action.type === "move") {
            menuSelection += action.dir[1];
            if (menuSelection < 0) {
                menuSelection = 0;
            } else if (menuSelection >= MAIN_MENU_OPTIONS.length) {
                menuSelection = MAIN_MENU_OPTIONS.length - 1;
            }
        } else if (action.type === "enter") {
            switch (MAIN_MENU_OPTIONS[menuSelection]) {
                case "New Game": {
                    entityService.clearEntities();
                    player = new Entity(
                        mapService.getMaxMapId() + 1,
                        0,
                        CONSTANTS.SCREEN_WIDTH,
                        CONSTANTS.SCREEN_HEIGHT,
                        "white",
                        "私",
                        true,
                        "Player",
                        RenderOrder.ACTOR,
                    );
                    entityService.addEntity(player);
                    componentService.addComponent(new EquipmentComponent(player.id));
                    componentService.addComponent(new FighterComponent(player.id, 100, 1, 2));
                    componentService.addComponent(new InventoryComponent(player.id, 26));
                    componentService.addComponent(new LevelComponent(player.id));

                    gameState = GameState.PLAYER_TURN;

                    mapService.addMap(new TutorialMapGenerator(entityService, componentService, mapService).generate(
                        {
                            height: CONSTANTS.MAP_HEIGHT,
                            width: CONSTANTS.MAP_WIDTH,
                        },
                        mapService.getMaxMapId() + 1,
                        entityService.getMaxEntityId() + 1,
                        player,
                        1));

                    messageLog = new MessageLog(CONSTANTS.MESSAGE_X, CONSTANTS.MESSAGE_HEIGHT, CONSTANTS.MESSAGE_WIDTH);
                    break;
                }
                case "Load Game": {
                    const savedGameString = localStorage.getItem("savedGame");
                    if (savedGameString) {
                        const savedGame: ISavedGame = JSON.parse(savedGameString);
                        const loadedGame = loadGame(savedGame);
                        for (const e of loadedGame.entities) {
                            entityService.addEntity(e);
                        }
                        for (const m of loadedGame.gameMaps) {
                            const oldId = m.id;
                            mapService.addMap(m);
                            if (loadedGame.currentMap === oldId) {
                                mapService.setCurrentMap(m.id);
                            }
                        }
                        gameState = loadedGame.gameState;
                        messageLog = loadedGame.messageLog;
                        player = loadedGame.player;
                    }
                    break;
                }
            }
        }
    } else if (gameState === GameState.PLAYER_TURN) {
        if (action.type === "move") {
            let targetEntity: Entity = null;
            {
                const targetEntities = entityService
                    .getEntitiesAtPos(player.x + action.dir[0], player.y + action.dir[1]);
                if (targetEntities.length > 0) {
                    targetEntity = targetEntities[0];
                }
            }

            if (targetEntity) {
                results = results.concat(
                    systemService.dispatchEvent(targetEntity.id, new AttackEvent(player.id)),
                );
            }

            if (!mapService.getCurrentMap().isBlocked(player.x + action.dir[0], player.y + action.dir[1])
                && (!targetEntity || !targetEntity.isBlocking)) {
                player.x += action.dir[0];
                player.y += action.dir[1];
            }

            gameState = GameState.ENEMY_TURN;
        } else if (action.type === "pickup") {
            const pickedUpEntities = entityService
                .getEntitiesAtPos(player.x, player.y)
                .map((e) => e.id);
            if (pickedUpEntities.length === 0) {
                messageLog.addMessage(new Message("There is nothing here to pick up.", "yellow"));
            } else {
                results = results.concat(
                    systemService.multiDispatchEvent(pickedUpEntities, new PickupEvent(player.id)),
                );
            }
            gameState = GameState.ENEMY_TURN;
        } else if (action.type === "open-character-panel") {
            previousGameState = gameState;
            gameState = GameState.SHOW_CHARACTER_PANEL;
        } else if (action.type === "open-inventory") {
            previousGameState = gameState;
            menuSelection = 0;
            gameState = GameState.SHOW_INVENTORY;
        } else if (action.type === "exit") {
            saveGame(player,
                entityService.entities,
                mapService.maps,
                mapService.getCurrentMapId(),
                messageLog,
                gameState);
            menuSelection = 0;
            gameState = GameState.MAIN_MENU;
            entityService.clearEntities();
            mapService.clearMaps();
        } else if (action.type === "enter") {
            results = results.concat(
                systemService.multiDispatchEvent(
                    entityService
                        .getEntitiesAtPos(player.x, player.y)
                        .map((e) => e.id),
                    new EnterEvent(),
                ),
            );
        } else if (action.type === "wait") {
            messageLog.addMessage(
                new Message("You wait for a moment.", "white"),
            );
            gameState = GameState.ENEMY_TURN;
        }
    } else if (gameState === GameState.PLAYER_DEAD) {
        if (action.type === "open-inventory") {
            previousGameState = gameState;
            menuSelection = 0;
            gameState = GameState.SHOW_INVENTORY;
        }
    } else if (gameState === GameState.SHOW_CHARACTER_PANEL) {
        if (action.type === "exit") {
            gameState = previousGameState;
        }
    } else if (gameState === GameState.SHOW_INVENTORY) {
        const playerInventory = componentService
            .getComponentByEntityIdAndType(player.id, "InventoryComponent") as InventoryComponent;
        if (action.type === "exit") {
            gameState = previousGameState;
        } else if (action.type === "move") {
            menuSelection += action.dir[1];
            if (menuSelection < 0) {
                menuSelection = 0;
            } else if (menuSelection >= playerInventory.items.length) {
                menuSelection = playerInventory.items.length - 1;
            }
        } else if (action.type === "enter") {
            results = results.concat(
                systemService.dispatchEvent(
                    playerInventory.items[menuSelection],
                    new UseEvent(player.id),
                ),
            );
            if (menuSelection >= playerInventory.items.length) {
                menuSelection = playerInventory.items.length - 1;
            }
        } else if (action.type === "drop") {
            if (menuSelection < 0) {
                menuSelection = 0;
            }
            if (menuSelection >= playerInventory.items.length) {
                menuSelection = playerInventory.items.length - 1;
            }

            results.concat(
                systemService.dispatchEvent(playerInventory.items[menuSelection], new DropEvent(player.id)),
            );

            if (menuSelection >= playerInventory.items.length) {
                menuSelection = playerInventory.items.length - 1;
            }
        }
    } else if (gameState === GameState.TARGETING) {
        const playerInventory = componentService
            .getComponentByEntityIdAndType(player.id, "InventoryComponent") as InventoryComponent;
        if (action.type === "move") {
            if (!mapService.getCurrentMap()
                .getTile(targetTile[0] + action.dir[0], targetTile[1] + action.dir[1]).blocksSight
            ) {
                targetTile[0] += action.dir[0];
                targetTile[1] += action.dir[1];
            }
        } else if (action.type === "enter") {
            results = results.concat(
                systemService.dispatchEvent(
                    playerInventory.items[menuSelection],
                    new UseEvent(player.id, targetTile[0], targetTile[1]),
                ),
            );
            if (menuSelection >= playerInventory.items.length) {
                menuSelection = playerInventory.items.length - 1;
            }
            gameState = previousGameState;
        } else if (action.type === "exit") {
            gameState = previousGameState;
        }
    }

    addResultsToMessageLog(results);

    draw(con, panel, player);

    entityTick();
}
