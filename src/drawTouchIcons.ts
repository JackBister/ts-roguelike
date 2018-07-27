
import { IAction } from "./Action";
import { Entity } from "./Entity";
import { GameState } from "./GameState";

export function drawTouchIcons(
    gameState: GameState,
    player: Entity,
    entities: Entity[],
    playerTick: (action: IAction) => void,
) {
    const touchIcons = document.getElementById("touch-icons");
    while (touchIcons.firstChild) {
        touchIcons.removeChild(touchIcons.firstChild);
    }
    if (gameState === GameState.SHOW_INVENTORY && player.inventory.items.length > 0) {
        const dropIcon = document.createElement("span");
        dropIcon.setAttribute("class", "oi");
        dropIcon.setAttribute("data-glyph", "data-transfer-download");
        dropIcon.ontouchstart = (evt) => {
            evt.stopPropagation();
            playerTick({ type: "drop" });
        };
        touchIcons.appendChild(dropIcon);
    }
    if (gameState !== GameState.MAIN_MENU
        && gameState !== GameState.SHOW_INVENTORY
        && gameState !== GameState.TARGETING
        && gameState !== GameState.SHOW_CHARACTER_PANEL
        && gameState !== GameState.LEVEL_UP
        && entities.some((e) => e.item && e.x === player.x && e.y === player.y)
    ) {
        const pickupIcon = document.createElement("span");
        pickupIcon.setAttribute("class", "oi");
        pickupIcon.setAttribute("data-glyph", "data-transfer-upload");
        pickupIcon.ontouchstart = (evt) => {
            evt.stopPropagation();
            playerTick({ type: "pickup" });
        };
        touchIcons.appendChild(pickupIcon);
    }
    if (gameState !== GameState.MAIN_MENU
        && gameState !== GameState.SHOW_INVENTORY
        && gameState !== GameState.TARGETING
        && gameState !== GameState.SHOW_CHARACTER_PANEL
        && gameState !== GameState.LEVEL_UP
        && entities.some((e) => e.stairs && e.x === player.x && e.y === player.y)
    ) {
        const stairsIcon = document.createElement("span");
        stairsIcon.setAttribute("class", "oi");
        stairsIcon.setAttribute("data-glyph", "elevator");
        stairsIcon.ontouchstart = (evt) => {
            evt.stopPropagation();
            playerTick({ type: "enter" });
        };
        touchIcons.appendChild(stairsIcon);
    }
    if (gameState !== GameState.MAIN_MENU
        && gameState !== GameState.SHOW_INVENTORY
        && gameState !== GameState.TARGETING
        && gameState !== GameState.SHOW_CHARACTER_PANEL
        && gameState !== GameState.LEVEL_UP
    ) {
        const inventoryIcon = document.createElement("span");
        inventoryIcon.setAttribute("class", "oi");
        inventoryIcon.setAttribute("data-glyph", "briefcase");
        inventoryIcon.ontouchstart = (evt) => {
            evt.stopPropagation();
            playerTick({ type: "open-inventory" });
        };
        touchIcons.appendChild(inventoryIcon);
    }
    if (gameState !== GameState.MAIN_MENU
        && gameState !== GameState.SHOW_INVENTORY
        && gameState !== GameState.TARGETING
        && gameState !== GameState.SHOW_CHARACTER_PANEL
        && gameState !== GameState.LEVEL_UP
    ) {
        const characterPanelIcon = document.createElement("span");
        characterPanelIcon.setAttribute("class", "oi");
        characterPanelIcon.setAttribute("data-glyph", "person");
        characterPanelIcon.ontouchstart = (evt) => {
            evt.stopPropagation();
            playerTick({ type: "open-character-panel" });
        };
        touchIcons.appendChild(characterPanelIcon);
    }
    if (gameState !== GameState.MAIN_MENU
        && gameState !== GameState.LEVEL_UP
    ) {
        const exitIcon = document.createElement("span");
        exitIcon.setAttribute("class", "oi");
        exitIcon.setAttribute("data-glyph", "circle-x");
        exitIcon.ontouchstart = (evt) => {
            evt.stopPropagation();
            playerTick({ type: "exit" });
        };
        touchIcons.appendChild(exitIcon);
    }
}