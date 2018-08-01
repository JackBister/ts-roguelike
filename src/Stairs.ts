import { Entity } from "./Entity";

export class Stairs {
    public owner: Entity;

    constructor(public readonly floor: number) {}

    public toJSON() {
        const ret = { ...(this as any) };
        ret._ownerId = ret.owner.id;
        ret.owner = undefined;
        ret._type = "Stairs";
        return ret;
    }
}
