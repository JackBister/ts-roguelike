import * as ROT from "rot-js"

import { Fighter } from "./Fighter";
import { Ai } from "./Ai";
import { GameMap } from "./GameMap";
import { RenderOrder } from "./RenderOrder";

export let entities: Entity[] = [];

export class Entity {
    constructor(x: number, y: number, color: string, symbol: string, isBlocking: boolean, name: string, renderOrder: RenderOrder, fighter: Fighter = null, ai: Ai = null) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.symbol = symbol;
        this.isBlocking = isBlocking;
        this.name = name;
        this.renderOrder = renderOrder;
        this.fighter = fighter;
        this.ai = ai;

        if (this.fighter) {
            this.fighter.owner = this;
        }

        if (this.ai) {
            this.ai.owner = this;
        }
    }

    public distanceTo(other: Entity) {
        let dx = other.x - this.x;
        let dy = other.y - this.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    public move(dx: number, dy: number) {
        this.x += dx;
        this.y += dy;
    }

    public moveAstar(target: Entity, map: GameMap, entities: Entity[]) {
        let pather = new ROT.Path.AStar(target.x, target.y, (x, y) => {
            return !map.isBlocked(x, y) && !entities.some(e => e.x == x && e.y == y);
        });

        let hasStepped = false;

        pather.compute(this.x, this.y, (x, y) => {
            if (hasStepped) {
                return;
            }
            hasStepped = true;
            this.x = x;
            this.y = y;
        });
        
        if (!hasStepped) {
            this.moveTowards(target.x, target.y, map, entities);
        }
    }

    public moveTowards(targetX: number, targetY: number, map: GameMap, entities: Entity[]) {
        let dx = targetX - this.x;
        let dy = targetY - this.y;

        let distance = Math.sqrt(dx * dx + dy * dy);

        dx = Math.round(dx / distance);
        dy = Math.round(dy / distance);

        if (!map.isBlocked(this.x + dx, this.y + dy) && !entities.some(e => e.x == this.x + dx && e.y == this.y + dy)) {
            this.move(dx, dy);
        }
    }

    public x: number;
    public y: number;

    public color: string;
    public symbol: string;

    public isBlocking: boolean;
    public name: string;

    public fighter: Fighter;
    public ai: Ai;

    public renderOrder: RenderOrder;
};
