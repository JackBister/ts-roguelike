import { Entity } from "./Entity";
import { ITurnResult } from "./TurnResult";

export interface IItem {
    owner: Entity;
    name: string;

    use: (user: Entity, entities: Entity[]) => ITurnResult[];
}
