import { BasicMonsterAi } from "./BasicMonsterAi";
import { Entity } from "./Entity";
import { Fighter } from "./Fighter";
import { GameMap } from "./GameMap";
import { DEFAULT_OPTIONS, IGameMapOptions, IMapGenerator } from "./MapGenerator";
import { randomInt } from "./randomInt";
import { Rect } from "./Rect";
import { RenderOrder } from "./RenderOrder";

export class TutorialMapGenerator implements IMapGenerator {
    private opts: IGameMapOptions;

    public generate(opts: IGameMapOptions, entities: Entity[]) {
        this.opts = {
            height: opts.height || DEFAULT_OPTIONS.height,
            width: opts.width || DEFAULT_OPTIONS.width,

            player: opts.player || DEFAULT_OPTIONS.player,

            maxMonstersPerRoom: opts.maxMonstersPerRoom || DEFAULT_OPTIONS.maxMonstersPerRoom,
            maxRooms: opts.maxRooms || DEFAULT_OPTIONS.maxRooms,
            roomMaxSize: opts.roomMaxSize || DEFAULT_OPTIONS.roomMaxSize,
            roomMinSize: opts.roomMinSize || DEFAULT_OPTIONS.roomMinSize,
        };

        const ret = new GameMap(this.opts.height, this.opts.width);

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
                this.placeEnemies(newRoom, entities);
            }
        }

        if (this.opts.player) {
            const room0center = rooms[0].getCenter();
            this.opts.player.x = room0center[0];
            this.opts.player.y = room0center[1];
        }
        return ret;
    }

    private createHorizontalTunnel(map: GameMap, x1: number, x2: number, y) {
        if (x1 < 0 || x2 < 0
            || x1 > this.opts.width || x2 > this.opts.width
        ) {
            throw new Error(`Out of bounds! (Width: ${this.opts.width}, x1: ${x1}, x2: ${x2})`);
            return;
        }

        for (let x = Math.min(x1, x2); x < Math.max(x1, x2) + 1; ++x) {
            const tile = map.getTile(x, y);
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
            const tile = map.getTile(x, y);
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
                const tile = map.getTile(x, y);
                tile.isBlocked = false;
                tile.blocksSight = false;
            }
        }
    }

    private placeEnemies(room: Rect, entities: Entity[]) {
        const numMonsters = randomInt(0, this.opts.maxMonstersPerRoom);

        for (let i = 0; i < numMonsters; ++i) {
            const x = randomInt(room.getX() + 1, room.getX2() - 1);
            const y = randomInt(room.getY() + 1, room.getY2() - 1);
            if (!entities.some((e) => e.x === x && e.y === y)) {
                let monster: Entity = null;
                if (randomInt(0, 100) < 80) {
                    monster = new Entity(
                        x,
                        y,
                        "white",
                        "O",
                        true,
                        "Orc",
                        RenderOrder.ACTOR,
                        new Fighter(10, 0, 3),
                        new BasicMonsterAi(),
                    );
                } else {
                    monster = new Entity(
                        x,
                        y,
                        "white",
                        "T",
                        true,
                        "Troll",
                        RenderOrder.ACTOR,
                        new Fighter(16, 1, 4),
                        new BasicMonsterAi(),
                    );
                }
                entities.push(monster);
            }
        }
    }
}
