import { aiFromObject } from "./Ai";
import { Entity } from "./Entity";
import { fighterFromObject } from "./Fighter";
import { inventoryFromObject } from "./Inventory";
import { itemFromObject } from "./Item";
import { Level } from "./Level";
import { Stairs } from "./Stairs";
import { ITile } from "./Tile";

export class GameMap {
    public static fromOtherMap(mapToCopy: GameMap): GameMap {
        const newEntities = [];
        for (const e of mapToCopy.entities) {
            const ne = new Entity(
                e.x,
                e.y,
                e.color,
                e.symbol,
                e.isBlocking,
                e.name,
                e.renderOrder,
            );
            if (e.ai) {
                ne.ai = aiFromObject(e.ai);
                ne.ai.owner = ne;
            }
            if (e.fighter) {
                ne.fighter = fighterFromObject(e.fighter);
                ne.fighter.owner = ne;
            }
            if (e.inventory) {
                ne.inventory = inventoryFromObject(e.inventory);
                ne.inventory.owner = ne;
            }
            if (e.item) {
                ne.item = itemFromObject(e.item);
                ne.item.owner = ne;
            }
            if (e.stairs) {
                ne.stairs = new Stairs(e.stairs.floor);
                ne.stairs.owner = ne;
            }
            if (e.level) {
                ne.level = new Level(e.level.currentLevel,
                    e.level.currentXp,
                    e.level.levelUpBase,
                    e.level.levelUpFactor);
                ne.level.owner = ne;
            }
            newEntities.push(ne);
        }

        const ret = new GameMap(mapToCopy.height, mapToCopy.width, newEntities);

        for (let x = 0; x < ret.width; ++x) {
            for (let y = 0; y < ret.height; ++y) {
                ret.tiles[x][y] = { ...mapToCopy.tiles[x][y] };
            }
        }

        return ret;
    }

    private tiles: ITile[][] = [];

    constructor(
        public readonly height: number,
        public readonly width: number,
        public readonly entities: Entity[],
        public readonly dungeonLevel = 1,
    ) {
        for (let x = 0; x < this.width; ++x) {
            this.tiles[x] = [];
            for (let y = 0; y < this.height; ++y) {
                this.tiles[x].push({
                    blocksSight: true,
                    isBlocked: true,
                    isSeen: false,
                });
            }
        }
    }

    public getTile(x: number, y: number) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        return this.tiles[x][y];
    }

    public isBlocked(x: number, y: number) {
        const tile = this.getTile(x, y);
        return !tile || tile.isBlocked;
    }
}
