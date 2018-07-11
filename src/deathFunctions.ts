import { Entity } from "./Entity";
import { GameState } from "./GameState";
import { Message } from "./Message";
import { RenderOrder } from "./RenderOrder";

export function killPlayer(player: Entity) {
    player.symbol = "%";
    player.color = "darkred";
    player.renderOrder = RenderOrder.CORPSE;

    return { message: new Message("You died!", "red"), state: GameState.PLAYER_DEAD };
}

export function killMonster(monster: Entity) {
    const message = `${monster.name.capitalize()} is dead!`;

    monster.symbol = "%";
    monster.color = "darkred";
    monster.isBlocking = false;
    monster.fighter = null;
    monster.ai = null;
    monster.name = `Remains of ${monster.name}`;
    monster.renderOrder = RenderOrder.CORPSE;

    return { message: new Message(message, "orange") };
}
