import { MapGenerator, GameMapOptions, DEFAULT_OPTIONS } from "./MapGenerator";
import { GameMap } from "./GameMap";
import { randomInt } from "./randomInt";
import { Rect } from "./Rect";
import { Entity } from "./Entity";
import { RenderOrder } from "./RenderOrder";
import { Fighter } from "./Fighter";
import { BasicMonsterAi } from "./BasicMonsterAi";

export class TutorialMapGenerator implements MapGenerator {
    public generate(opts: GameMapOptions, entities: Entity[]) {
        this.opts = {
            height: opts.height || DEFAULT_OPTIONS.height,
            width: opts.width || DEFAULT_OPTIONS.width,

            player: opts.player || DEFAULT_OPTIONS.player,

            roomMaxSize: opts.roomMaxSize || DEFAULT_OPTIONS.roomMaxSize,
            roomMinSize: opts.roomMinSize || DEFAULT_OPTIONS.roomMinSize,
            maxMonstersPerRoom: opts.maxMonstersPerRoom || DEFAULT_OPTIONS.maxMonstersPerRoom,
            maxRooms: opts.maxRooms || DEFAULT_OPTIONS.maxRooms
        };

        let ret = new GameMap(this.opts.height, this.opts.width);

        let numRooms = 0;
        let rooms: Rect[] = [];

        for (let i = 0; i < this.opts.maxRooms; ++i) {
            let h = randomInt(this.opts.roomMinSize, this.opts.roomMaxSize);
            let w = randomInt(this.opts.roomMinSize, this.opts.roomMaxSize);
            let x = randomInt(0, this.opts.width - w - 1);
            let y = randomInt(0, this.opts.height - h - 1);

            let newRoom = new Rect(x, y, w, h);
            if (!rooms.some(r => r.intersects(newRoom))) {
                this.createRoom(ret, newRoom);

                if (numRooms != 0) {
                    let [newCenterX, newCenterY] = newRoom.getCenter();
                    let [prevCenterX, prevCenterY] = rooms[numRooms - 1].getCenter();

                    if (randomInt(0, 1) == 1) {
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
            let room0center = rooms[0].getCenter();
            this.opts.player.x = room0center[0];
            this.opts.player.y = room0center[1];
        }
        return ret;
    }

    private createHorizontalTunnel(map: GameMap, x1: number, x2: number, y) {
        if (x1 < 0 || x2 < 0
            || x1 > this.opts.width || x2 > this.opts.width
        ) {
            console.log("GameMap.createHorizontalTunnel: Out of bounds!");
            return;
        }

        for (let x = Math.min(x1, x2); x < Math.max(x1, x2) + 1; ++x) {
            let tile = map.getTile(x, y);
            tile.isBlocked = false;
            tile.blocksSight = false;
        }
    }

    private createVerticalTunnel(map: GameMap, y1: number, y2: number, x) {
        if (y1 < 0 || y2 < 0
            || y1 > this.opts.height || y2 > this.opts.height
        ) {
            console.log("GameMap.createVerticalTunnel: Out of bounds!");
            return;
        }

        for (let y = Math.min(y1, y2); y < Math.max(y1, y2) + 1; ++y) {
            let tile = map.getTile(x, y);
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
            console.log("GameMap.createRoom: Out of bounds!");
            return;
        }

        for (let x = x1 + 1; x < x2; ++x) {
            for (let y = y1 + 1; y < y2; ++y) {
                let tile = map.getTile(x, y);
                tile.isBlocked = false;
                tile.blocksSight = false;
            }
        }
    }
    
    private placeEnemies(room: Rect, entities: Entity[]) {
        let numMonsters = randomInt(0, this.opts.maxMonstersPerRoom);

        for (let i = 0; i < numMonsters; ++i) {
            let x = randomInt(room.getX() + 1, room.getX2() - 1);
            let y = randomInt(room.getY() + 1, room.getY2() - 1);
            if (!entities.some(e => e.x == x && e.y == y)) {
                let monster: Entity = null;
                if (randomInt(0, 100) < 80) {
                    monster = new Entity(
                        x,
                        y,
                        'white',
                        'O',
                        true,
                        'Orc',
                        RenderOrder.ACTOR,
                        new Fighter(10, 0, 3),
                        new BasicMonsterAi()
                    );
                } else {
                    monster = new Entity(
                        x,
                        y,
                        'white',
                        'T',
                        true,
                        'Troll',
                        RenderOrder.ACTOR,
                        new Fighter(16, 1, 4),
                        new BasicMonsterAi()
                    );
                }
                entities.push(monster);
            }
        }
    }

    private opts: GameMapOptions;
}
