
import { IAction } from "./Action";
import { ComponentService } from "./components/Component.service";
import { InventoryComponent } from "./components/InventoryComponent";
import { container } from "./config/container";
import { EntityService } from "./entities/Entity.service";
import { Entity } from "./Entity";
import { GameState } from "./GameState";

const componentService = container.get<ComponentService>("ComponentService");
const entityService = container.get<EntityService>("EntityService");

export function drawTouchIcons(
    gameState: GameState,
    player: Entity,
    playerTick: (action: IAction) => void,
) {
    const touchIcons = document.getElementById("touch-icons");
    while (touchIcons.firstChild) {
        touchIcons.removeChild(touchIcons.firstChild);
    }
    if (gameState === GameState.MAIN_MENU) {
        return;
    }
    const playerInventory = componentService
        .getComponentByEntityIdAndType(player.id, "InventoryComponent") as InventoryComponent;
    if (gameState === GameState.SHOW_INVENTORY && playerInventory.items.length > 0) {
        const dropIcon = document.createElement("span");
        dropIcon.setAttribute("class", "oi");
        dropIcon.setAttribute("data-glyph", "data-transfer-download");
        dropIcon.ontouchstart = (evt) => {
            evt.stopPropagation();
            playerTick({ type: "drop" });
        };
        touchIcons.appendChild(dropIcon);
    }
    if (gameState !== GameState.SHOW_INVENTORY
        && gameState !== GameState.TARGETING
        && gameState !== GameState.SHOW_CHARACTER_PANEL
        && gameState !== GameState.LEVEL_UP
        && entityService.entities.some(
            (e) => e.x === player.x && e.y === player.y
                && componentService.entityHasComponentOfType(e.id, "PickupableComponent"),
        )
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
    if (gameState !== GameState.SHOW_INVENTORY
        && gameState !== GameState.TARGETING
        && gameState !== GameState.SHOW_CHARACTER_PANEL
        && gameState !== GameState.LEVEL_UP
        && entityService.entities.some(
            (e) => e.x === player.x
                && e.y === player.y
                && componentService.entityHasComponentOfType(e.id, "StairComponent"),
        )
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
    if (gameState !== GameState.SHOW_INVENTORY
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
    if (gameState !== GameState.SHOW_INVENTORY
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
    if (gameState !== GameState.LEVEL_UP) {
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
