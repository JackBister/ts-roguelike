import { Entity } from "./Entity";
import { Message } from "./Message";

export interface ITurnResult {
    consumed?: boolean;
    dead?: Entity;
    dequipped?: Entity;
    equip?: Entity;
    equipped?: Entity;
    itemAdded?: number;
    itemDropped?: number;
    leveledUp?: boolean;
    message?: Message;
    target?: Entity;
    targeting?: number;
    xp?: number;
}
