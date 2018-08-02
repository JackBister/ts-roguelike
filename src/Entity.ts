import * as ROT from "rot-js";

import { Equipment } from "./Equipment";
import { Equippable } from "./Equippable";
import { GameMap } from "./GameMap";
import { RenderOrder } from "./RenderOrder";
import { Stairs } from "./Stairs";

export class Entity {
    constructor(
        public id: number,
        public x: number,
        public y: number,
        public color: string,
        public symbol: string,
        public isBlocking: boolean,
        public name: string,
        public renderOrder: RenderOrder,
        public stairs: Stairs = null,
        public equipment: Equipment = null,
        public equippable: Equippable = null,
        public isActive: boolean = true,
        public mapId: number = null,
    ) {
        if (this.stairs) {
            this.stairs.owner = this;
        }

        if (this.equipment) {
            this.equipment.owner = this;
        }

        if (this.equippable) {
            this.equippable.owner = this;
        }
    }

    public distanceTo(other: Entity) {
        return this.distanceToPos(other.x, other.y);
    }

    public distanceToPos(x: number, y: number) {
        const dx = x - this.x;
        const dy = y - this.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    public move(dx: number, dy: number) {
        this.x += dx;
        this.y += dy;
    }

    public moveAstar(target: Entity, map: GameMap, entities: Entity[]) {
        const pather = new ROT.Path.AStar(target.x, target.y, (x, y) => {
            return !map.isBlocked(x, y) && !entities.some((e) => e.x === x && e.y === y);
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

        const distance = Math.sqrt(dx * dx + dy * dy);

        dx = Math.round(dx / distance);
        dy = Math.round(dy / distance);

        if (!map.isBlocked(this.x + dx, this.y + dy)
            && !entities.some((e) => e.x === this.x + dx && e.y === this.y + dy)) {
            this.move(dx, dy);
        }
    }
}
