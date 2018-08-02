import { Entity } from "./Entity";
import { Message } from "./Message";

export type EventResult = IConsumedResult
    | IDeadResult
    | IDequippedResult
    | IEquippedResult
    | IGetPropertyResult
    | IItemAddedResult
    | IItemDroppedResult
    | ILeveledUpResult
    | IMessageResult
    | ITargetResult
    | ITargetingResult
    | IXpResult;

interface IConsumedResult {
    type: "consumed";
}

interface IDeadResult {
    type: "dead";
    dead: Entity;
}

interface IDequippedResult {
    type: "dequipped";
    dequipped: number;
}

interface IEquippedResult {
    type: "equipped";
    equipped: number;
}

interface IGetPropertyResult {
    type: "getProperty";
    value: number;
}

interface IItemAddedResult {
    type: "itemAdded";
    itemAdded: number;
}

interface IItemDroppedResult {
    type: "itemDropped";
    itemDropped: number;
}

interface ILeveledUpResult {
    type: "leveledUp";
}

interface IMessageResult {
    type: "message";
    message: Message;
}

interface ITargetResult {
    type: "target";
    target: Entity;
}

interface ITargetingResult {
    type: "targeting";
    targeting: number;
}

interface IXpResult {
    type: "xp";
    xp: number;
}
