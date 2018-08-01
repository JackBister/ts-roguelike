import { AttackEvent } from "./AttackEvent";
import { EnterEvent } from "./EnterEvent";
import { GainXpEvent } from "./GainXpEvent";
import { TakeDamageEvent } from "./TakeDamageEvent";
import { ThinkEvent } from "./ThinkEvent";

export interface IEvent {
    type: string;
}

export type REvent = AttackEvent
                   | EnterEvent
                   | GainXpEvent
                   | TakeDamageEvent
                   | ThinkEvent;
