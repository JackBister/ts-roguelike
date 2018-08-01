import { AttackEvent } from "./AttackEvent";
import { EnterEvent } from "./EnterEvent";
import { TakeDamageEvent } from "./TakeDamageEvent";
import { ThinkEvent } from "./ThinkEvent";

export interface IEvent {
    type: string;
}

export type REvent = AttackEvent
                   | EnterEvent
                   | TakeDamageEvent
                   | ThinkEvent;
