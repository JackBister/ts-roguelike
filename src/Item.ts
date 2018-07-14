import { Entity } from "./Entity";

export class Item {
    public owner: Entity;

    constructor(public name: string) {}
}
