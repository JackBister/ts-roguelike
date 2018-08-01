import { Entity } from "./Entity";
import { Equipment } from "./Equipment";
import { Equippable } from "./Equippable";
import { fighterFromObject } from "./Fighter";
import { inventoryFromObject } from "./Inventory";
import { itemFromObject } from "./Item";
import { Level } from "./Level";
import { Stairs } from "./Stairs";
import { ITile } from "./Tile";

export class GameMap {
    public static fromOtherMap(mapToCopy: GameMap): GameMap {
        const newEntities = [];
        // TODO:
        /*
        for (const e of mapToCopy.entities) {
            const ne = new Entity(
                e.id,
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
                ne.item = itemFromObject(e).item;
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
            if (e.equipment) {
                ne.equipment = new Equipment();
                for (let i = 0; i < ne.equipment.equipped.length; ++i) {
                    if (e.equipment.equipped[i]) {
                        const eq = e.equipment.equipped[i];
                        const neq = ne.inventory.items.filter((item) => item.id === (eq as any)._ownerId)[0].equippable;
                        ne.equipment.equipped[i] = neq;
                    }
                }
                ne.equipment.owner = ne;
            }
            if (e.equippable) {
                ne.equippable = new Equippable(
                    e.equippable.slot,
                    e.equippable.powerBonus,
                    e.equippable.defenseBonus,
                    e.equippable.maxHpBonus,
                );
                ne.equippable.owner = ne;
            }
            newEntities.push(ne);
        }
        */

        const ret = new GameMap(mapToCopy.height, mapToCopy.width, mapToCopy.dungeonLevel);

        for (let x = 0; x < ret.width; ++x) {
            for (let y = 0; y < ret.height; ++y) {
                ret.tiles[x][y] = { ...mapToCopy.tiles[x][y] };
            }
        }

        return ret;
    }

    public id: number;
    private tiles: ITile[][] = [];

    constructor(
        public readonly height: number,
        public readonly width: number,
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
