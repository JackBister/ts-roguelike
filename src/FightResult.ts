import { Entity } from "./Entity";
import { Message } from "./Message";

export interface FightResult {
    message?: Message;
    dead?: Entity;
}
