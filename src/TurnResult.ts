import { Entity } from "./Entity";
import { Item } from "./Item";
import { Message } from "./Message";

export interface ITurnResult {
    message?: Message;
    dead?: Entity;
    itemAdded?: Entity;
}
