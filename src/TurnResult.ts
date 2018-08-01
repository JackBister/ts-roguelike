import { Entity } from "./Entity";
import { Message } from "./Message";

export interface ITurnResult {
    consumed?: boolean;
    dead?: Entity;
    dequipped?: Entity;
    equip?: Entity;
    equipped?: Entity;
    itemAdded?: Entity;
    itemDropped?: Entity;
    message?: Message;
    target?: Entity;
    targeting?: Entity;
    xp?: number;
}
