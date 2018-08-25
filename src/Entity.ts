import * as ROT from "rot-js";

import { GameMap } from "./GameMap";
import { RenderOrder } from "./RenderOrder";

export class Entity {
    public static distanceTo(from: Entity, to: Entity) {
        return Entity.distanceToPos(from.x, from.y, to.x, to.y);
    }

    public static distanceToPos(fromX: number, fromY: number, toX: number, toY: number) {
        const dx = toX - fromX;
        const dy = toY - fromY;

        return Math.sqrt(dx * dx + dy * dy);
    }

    public static move(entity: Entity, dx: number, dy: number) {
        entity.x += dx;
        entity.y += dy;
    }

    public static moveAstar(mover: Entity, target: Entity, map: GameMap, entities: Entity[]) {
        const pather = new ROT.Path.AStar(target.x, target.y, (x, y) => {
            return !GameMap.isBlocked(map, x, y);
        });

        let hasStepped = false;

        pather.compute(mover.x, mover.y, (x, y) => {
            if (hasStepped
                || (x === mover.x && y === mover.y)
                || entities.some((e) => e.isBlocking && e.x === x && e.y === y)
            ) {
                return;
            }
            hasStepped = true;
            mover.x = x;
            mover.y = y;
        });

        if (!hasStepped) {
            this.moveTowards(mover, target.x, target.y, map, entities);
        }
    }

    public static moveTowards(mover: Entity, targetX: number, targetY: number, map: GameMap, entities: Entity[]) {
        let dx = targetX - mover.x;
        let dy = targetY - mover.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        dx = Math.round(dx / distance);
        dy = Math.round(dy / distance);

        if (!GameMap.isBlocked(map, mover.x + dx, mover.y + dy)
            && !entities.some((e) => e.x === mover.x + dx && e.y === mover.y + dy)
        ) {
            Entity.move(mover, dx, dy);
        }
    }

    constructor(
        public mapId: number,
        public id: number,
        public x: number,
        public y: number,
        public color: string,
        public symbol: string,
        public isBlocking: boolean,
        public name: string,
        public renderOrder: RenderOrder,
        public isActive: boolean = true,
    ) { }
}
