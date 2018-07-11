import { Entity } from "./Entity";
import { Message } from "./Message";

export interface IFightResult {
    message?: Message;
    dead?: Entity;
}
