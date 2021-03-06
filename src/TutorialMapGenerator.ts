import { inject, injectable } from "inversify";
import { BasicMonsterAiComponent } from "./components/BasicMonsterAiComponent";
import { ComponentService } from "./components/Component.service";
import { EquipmentSlot, EquippableComponent } from "./components/EquippableComponent";
import { FighterComponent } from "./components/FighterComponent";
import { PickupableComponent } from "./components/PickupableComponent";
import { StairComponent } from "./components/StairComponent";
import { UsableComponent } from "./components/UsableComponent";
import { EntityService } from "./entities/Entity.service";
import { Entity } from "./Entity";
import { GameMap } from "./GameMap";
import { DEFAULT_OPTIONS, IGameMapOptions, IMapGenerator } from "./MapGenerator";
import { randomInt } from "./randomInt";
import { fromDungeonLevel, randomChoiceFromMap } from "./randomUtils";
import { Rect } from "./Rect";
import { RenderOrder } from "./RenderOrder";
import { MapService } from "./services/Map.service";

@injectable()
export class TutorialMapGenerator implements IMapGenerator {
    private opts: IGameMapOptions;

    private entityId = null;
    private mapId = null;

    constructor(
        @inject("EntityService") private entityService: EntityService,
        @inject("ComponentService") private componentService: ComponentService,
        @inject("MapService") private mapService: MapService,
    ) { }

    public generate(opts: IGameMapOptions,
                    mapId: number,
                    startingEntityId: number,
                    player: Entity,
                    dungeonLevel: number,
    ) {
        this.opts = {
            height: opts.height || DEFAULT_OPTIONS.height,
            width: opts.width || DEFAULT_OPTIONS.width,

            maxRooms: opts.maxRooms || DEFAULT_OPTIONS.maxRooms,
            roomMaxSize: opts.roomMaxSize || DEFAULT_OPTIONS.roomMaxSize,
            roomMinSize: opts.roomMinSize || DEFAULT_OPTIONS.roomMinSize,
        };
        this.entityId = startingEntityId;
        this.mapId = mapId;

        const ret = new GameMap(this.opts.height, this.opts.width, dungeonLevel, mapId);

        let numRooms = 0;
        const rooms: Rect[] = [];

        for (let i = 0; i < this.opts.maxRooms; ++i) {
            const h = randomInt(this.opts.roomMinSize, this.opts.roomMaxSize);
            const w = randomInt(this.opts.roomMinSize, this.opts.roomMaxSize);
            const x = randomInt(0, this.opts.width - w - 1);
            const y = randomInt(0, this.opts.height - h - 1);

            const newRoom = new Rect(x, y, w, h);
            if (!rooms.some((r) => r.intersects(newRoom))) {
                this.createRoom(ret, newRoom);

                if (numRooms !== 0) {
                    const [newCenterX, newCenterY] = newRoom.getCenter();
                    const [prevCenterX, prevCenterY] = rooms[numRooms - 1].getCenter();

                    if (randomInt(0, 1) === 1) {
                        this.createHorizontalTunnel(ret, prevCenterX, newCenterX, prevCenterY);
                        this.createVerticalTunnel(ret, prevCenterY, newCenterY, newCenterX);
                    } else {
                        this.createVerticalTunnel(ret, prevCenterY, newCenterY, prevCenterX);
                        this.createHorizontalTunnel(ret, prevCenterX, newCenterX, newCenterY);
                    }
                }

                numRooms++;
                rooms.push(newRoom);
                this.placeEntities(newRoom, dungeonLevel);
            }
        }

        const room0center = rooms[0].getCenter();
        if (player) {
            player.x = room0center[0];
            player.y = room0center[1];
        }

        const prevFloor = this.mapService.maps.find((m) => m.dungeonLevel === dungeonLevel - 1);
        if (prevFloor) {
            const prevStairs = new Entity(
                this.mapId,
                this.entityId++,
                room0center[0],
                room0center[1],
                "white",
                ">",
                false,
                "Stairs",
                RenderOrder.STAIRS,
            );
            this.entityService.addEntity(prevStairs);
            this.componentService.addComponent(new StairComponent(prevFloor.id, prevStairs.id));
        }

        const lastRoomCenter = rooms[rooms.length - 1].getCenter();
        const nextStairs = new Entity(
            this.mapId,
            this.entityId++,
            lastRoomCenter[0],
            lastRoomCenter[1],
            "white",
            ">",
            false,
            "Stairs",
            RenderOrder.STAIRS,
        );
        this.entityService.addEntity(nextStairs);
        this.componentService.addComponent(
            new StairComponent(Math.max(this.mapId, this.mapService.getMaxMapId()) + 1, nextStairs.id),
        );

        return ret;
    }

    private createHorizontalTunnel(map: GameMap, x1: number, x2: number, y) {
        if (x1 < 0 || x2 < 0
            || x1 > this.opts.width || x2 > this.opts.width
        ) {
            throw new Error(`Out of bounds! (Width: ${this.opts.width}, x1: ${x1}, x2: ${x2})`);
        }

        for (let x = Math.min(x1, x2); x < Math.max(x1, x2) + 1; ++x) {
            const tile = GameMap.getTile(map, x, y);
            tile.isBlocked = false;
            tile.blocksSight = false;
        }
    }

    private createVerticalTunnel(map: GameMap, y1: number, y2: number, x) {
        if (y1 < 0 || y2 < 0
            || y1 > this.opts.height || y2 > this.opts.height
        ) {
            throw new Error(`Out of bounds! (Height: ${this.opts.height}, y1: ${y1}, y2: ${y2})`);
        }

        for (let y = Math.min(y1, y2); y < Math.max(y1, y2) + 1; ++y) {
            const tile = GameMap.getTile(map, x, y);
            tile.isBlocked = false;
            tile.blocksSight = false;
        }
    }

    private createRoom(map: GameMap, room: Rect) {
        const x1 = room.getX();
        const y1 = room.getY();
        const x2 = room.getX2();
        const y2 = room.getY2();

        if (x1 < 0 || y1 < 0 || x2 < 0 || y2 < 0
            || x1 > this.opts.width || x2 > this.opts.width || y1 > this.opts.height || y2 > this.opts.height
            || x1 > x2 || y1 > y2
        ) {
            throw new Error("Out of bounds!"
                + ` (Height: ${this.opts.height},`
                + ` Width: ${this.opts.width},`
                + ` x1: ${x1}, x2: ${x2},`
                + ` y1: ${y1}, y2: ${y2})`,
            );
        }

        for (let x = x1 + 1; x < x2; ++x) {
            for (let y = y1 + 1; y < y2; ++y) {
                const tile = GameMap.getTile(map, x, y);
                tile.isBlocked = false;
                tile.blocksSight = false;
            }
        }
    }

    private placeEntities(room: Rect, currentLevel: number) {
        const maxItemsPerRoom = fromDungeonLevel([[1, 1], [4, 2]], currentLevel);
        const maxMonstersPerRoom = fromDungeonLevel([[1, 2], [4, 3], [6, 5]], currentLevel);

        const numItems = randomInt(0, maxItemsPerRoom);
        const numMonsters = randomInt(0, maxMonstersPerRoom);

        const monsterChances = {
            orc: 80,
            troll: fromDungeonLevel([[3, 15], [5, 30], [7, 60]], currentLevel),
        };
        const itemChances = {
            confusionScroll: fromDungeonLevel([[2, 10]], currentLevel),
            fireballScroll: fromDungeonLevel([[6, 25]], currentLevel),
            healingPotion: 35,
            lightningScroll: fromDungeonLevel([[4, 25]], currentLevel),
            shield: fromDungeonLevel([[8, 15]], currentLevel),
            sword: fromDungeonLevel([[4, 5]], currentLevel),
        };

        for (let i = 0; i < numItems; ++i) {
            const x = randomInt(room.getX() + 1, room.getX2() - 1);
            const y = randomInt(room.getY() + 1, room.getY2() - 1);
            if (!this.entityService.getEntitiesAtPos(x, y).some((e) => e.isActive)) {
                let item: Entity = null;
                const itemChoice = randomChoiceFromMap(itemChances);
                if (itemChoice === "lightningScroll") {
                    item = new Entity(
                        this.mapId,
                        this.entityId++,
                        x,
                        y,
                        "yellow",
                        "#",
                        false,
                        "Lightning Scroll",
                        RenderOrder.ITEM,
                    );
                    this.componentService.addComponent(new PickupableComponent(item.id, "Lightning Scroll"));
                    this.componentService.addComponent(new UsableComponent(item.id, false, "lightningScroll"));
                } else if (itemChoice === "fireballScroll") {
                    item = new Entity(
                        this.mapId,
                        this.entityId++,
                        x,
                        y,
                        "red",
                        "#",
                        false,
                        "Fireball Scroll",
                        RenderOrder.ITEM,
                    );
                    this.componentService.addComponent(new PickupableComponent(item.id, "Fireball Scroll"));
                    this.componentService.addComponent(new UsableComponent(item.id, true, "fireballScroll"));
                } else if (itemChoice === "confusionScroll") {
                    item = new Entity(
                        this.mapId,
                        this.entityId++,
                        x,
                        y,
                        "lightpink",
                        "#",
                        false,
                        "Confusion Scroll",
                        RenderOrder.ITEM,
                    );
                    this.componentService.addComponent(new PickupableComponent(item.id, "Confusion Scroll"));
                    this.componentService.addComponent(new UsableComponent(item.id, true, "confusionScroll"));
                } else if (itemChoice === "healingPotion") {
                    item = new Entity(
                        this.mapId,
                        this.entityId++,
                        x,
                        y,
                        "violet",
                        "!",
                        false,
                        "Healing Potion",
                        RenderOrder.ITEM,
                    );
                    this.componentService.addComponent(new PickupableComponent(item.id, "Healing Potion"));
                    this.componentService.addComponent(new UsableComponent(item.id, false, "healingPotion"));
                } else if (itemChoice === "shield") {
                    item = new Entity(
                        this.mapId,
                        this.entityId++,
                        x,
                        y,
                        "darkorange",
                        "[",
                        false,
                        "Shield",
                        RenderOrder.ITEM,
                    );
                    this.componentService.addComponent(
                        new EquippableComponent(item.id, EquipmentSlot.OFF_HAND, 0, 1, 0),
                    );
                    this.componentService.addComponent(new PickupableComponent(item.id, "Shield"));
                } else if (itemChoice === "sword") {
                    item = new Entity(
                        this.mapId,
                        this.entityId++,
                        x,
                        y,
                        "skyblue",
                        "刀",
                        false,
                        "Sword",
                        RenderOrder.ITEM,
                    );
                    this.componentService.addComponent(
                        new EquippableComponent(item.id, EquipmentSlot.MAIN_HAND, 3, 0, 0),
                    );
                    this.componentService.addComponent(new PickupableComponent(item.id, "Sword"));
                }
                this.entityService.addEntity(item);
            }
        }

        for (let i = 0; i < numMonsters; ++i) {
            const x = randomInt(room.getX() + 1, room.getX2() - 1);
            const y = randomInt(room.getY() + 1, room.getY2() - 1);
            if (!this.entityService.getEntitiesAtPos(x, y).some((e) => e.isActive)) {
                let monster: Entity = null;
                const monsterChoice = randomChoiceFromMap(monsterChances);
                if (monsterChoice === "orc") {
                    monster = new Entity(
                        this.mapId,
                        this.entityId++,
                        x,
                        y,
                        "white",
                        "O",
                        true,
                        "Orc",
                        RenderOrder.ACTOR,
                    );
                    this.componentService.addComponent(new FighterComponent(monster.id, 20, 0, 4, 35));
                } else if (monsterChoice === "troll") {
                    monster = new Entity(
                        this.mapId,
                        this.entityId++,
                        x,
                        y,
                        "white",
                        "T",
                        true,
                        "Troll",
                        RenderOrder.ACTOR,
                    );
                    this.componentService.addComponent(new FighterComponent(monster.id, 30, 2, 8, 100));
                }
                this.entityService.addEntity(monster);
                this.componentService.addComponent(new BasicMonsterAiComponent(monster.id));
            }
        }
    }
}
