import { AttackEvent } from "./AttackEvent";
import { DropEvent } from "./DropEvent";
import { EnterEvent } from "./EnterEvent";
import { GainXpEvent } from "./GainXpEvent";
import { PickupEvent } from "./PickupEvent";
import { TakeDamageEvent } from "./TakeDamageEvent";
import { ThinkEvent } from "./ThinkEvent";
import { UseEvent } from "./UseEvent";

export interface IEvent {
    type: string;
}

export type REvent = AttackEvent
                   | DropEvent
                   | EnterEvent
                   | GainXpEvent
                   | PickupEvent
                   | TakeDamageEvent
                   | ThinkEvent
                   | UseEvent;
