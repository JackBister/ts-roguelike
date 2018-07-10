import { Tile } from "./Tile";
import * as ROT from 'rot-js'
import { Rect } from "./Rect";
import { randomInt } from "./randomInt";
import { Entity, entities } from "./Entity";
import { COLORS } from "./Colors";

interface GameMapOptions {
    height: number;
    width: number;

    player?: Entity;

    roomMaxSize?: number;
    roomMinSize?: number;
    maxMonstersPerRoom?: number;
    maxRooms?: number;
}

const DEFAULT_OPTIONS: GameMapOptions = {
    height: 45,
    width: 80,

    player: null,

    roomMaxSize: 10,
    roomMinSize: 6,
    maxMonstersPerRoom: 3,
    maxRooms: 30
};

export class GameMap {
    constructor(opts: GameMapOptions) {
        this.opts = {
            height: opts.height || DEFAULT_OPTIONS.height,
            width: opts.width || DEFAULT_OPTIONS.width,

            player: opts.player || DEFAULT_OPTIONS.player,

            roomMaxSize: opts.roomMaxSize || DEFAULT_OPTIONS.roomMaxSize,
            roomMinSize: opts.roomMinSize || DEFAULT_OPTIONS.roomMinSize,
            maxMonstersPerRoom: opts.maxMonstersPerRoom || DEFAULT_OPTIONS.maxMonstersPerRoom,
            maxRooms: opts.maxRooms || DEFAULT_OPTIONS.maxRooms
        };

        for (let x = 0; x < this.width; ++x) {
            this.tiles[x] = [];
            for (let y = 0; y < this.height; ++y) {
                this.tiles[x].push({
                    isBlocked: true,
                    blocksSight: true,
                    isSeen: false
                });
            }
        }

        this.generateMap();
    }

    public createRoom(room: Rect) {
        const x1 = room.getX();
        const y1 = room.getY();
        const x2 = room.getX2();
        const y2 = room.getY2();

        if (x1 < 0 || y1 < 0 || x2 < 0 || y2 < 0
            || x1 > this.width || x2 > this.width || y1 > this.height || y2 > this.height
            || x1 > x2 || y1 > y2
        ) {
            console.log("GameMap.createRoom: Out of bounds!");
            return;
        }

        for (let x = x1 + 1; x < x2; ++x) {
            for (let y = y1 + 1; y < y2; ++y) {
                this.tiles[x][y].isBlocked = false;
                this.tiles[x][y].blocksSight = false;
            }
        }
    }

    public createHorizontalTunnel(x1: number, x2: number, y) {
        if (x1 < 0 || x2 < 0
            || x1 > this.width || x2 > this.width
        ) {
            console.log("GameMap.createHorizontalTunnel: Out of bounds!");
            return;
        }

        for (let x = Math.min(x1, x2); x < Math.max(x1, x2) + 1; ++x) {
            this.tiles[x][y].isBlocked = false;
            this.tiles[x][y].blocksSight = false;
        }
    }

    public createVerticalTunnel(y1: number, y2: number, x) {
        if (y1 < 0 || y2 < 0
            || y1 > this.height || y2 > this.height
        ) {
            console.log("GameMap.createVerticalTunnel: Out of bounds!");
            return;
        }

        for (let y = Math.min(y1, y2); y < Math.max(y1, y2) + 1; ++y) {
            this.tiles[x][y].isBlocked = false;
            this.tiles[x][y].blocksSight = false;
        }
    }

    public getTile(x: number, y: number) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        return this.tiles[x][y];
    }

    public isBlocked(x: number, y: number) {
        let tile = this.getTile(x, y);
        return !tile || tile.isBlocked;
    }

    public get height() {
        return this.opts.height;
    }

    public get width() {
        return this.opts.width;
    }

    private generateMap() {
        let numRooms = 0;

        for (let i = 0; i < this.opts.maxRooms; ++i) {
            let h = randomInt(this.opts.roomMinSize, this.opts.roomMaxSize);
            let w = randomInt(this.opts.roomMinSize, this.opts.roomMaxSize);
            let x = randomInt(0, this.width - w - 1);
            let y = randomInt(0, this.height - h - 1);

            let newRoom = new Rect(x, y, w, h);
            if (!this.rooms.some(r => r.intersects(newRoom))) {
                this.createRoom(newRoom);

                if (numRooms == 0) {

                } else {
                    let [newCenterX, newCenterY] = newRoom.getCenter();
                    let [prevCenterX, prevCenterY] = this.rooms[numRooms - 1].getCenter();

                    if (randomInt(0, 1) == 1) {
                        this.createHorizontalTunnel(prevCenterX, newCenterX, prevCenterY);
                        this.createVerticalTunnel(prevCenterY, newCenterY, newCenterX);
                    } else {
                        this.createVerticalTunnel(prevCenterY, newCenterY, prevCenterX);
                        this.createHorizontalTunnel(prevCenterX, newCenterX, newCenterY);
                    }
                }

                numRooms++;
                this.rooms.push(newRoom);
                this.placeEnemies(newRoom, entities);
            }
        }

        if (this.opts.player) {
            let room0center = this.rooms[0].getCenter();
            this.opts.player.x = room0center[0];
            this.opts.player.y = room0center[1];
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
                    monster = { x: x, y: y, symbol: 'O', color: 'white', name: 'Orc', isBlocking: true };
                } else {
                    monster = { x: x, y: y, symbol: 'T', color: 'white', name: 'Troll', isBlocking: true };
                }
                entities.push(monster);
            }
        }
    }

    private opts: GameMapOptions;
    private rooms: Rect[] = [];
    private tiles: Tile[][] = [];
}
