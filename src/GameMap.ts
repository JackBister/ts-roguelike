import { ITile } from "./Tile";

export class GameMap {
    public static fromOtherMap(mapToCopy: GameMap): GameMap {
        const ret = new GameMap(mapToCopy.height, mapToCopy.width);

        for (let x = 0; x < ret.width; ++x) {
            for (let y = 0; y < ret.height; ++y) {
                ret.tiles[x][y] = { ...mapToCopy.tiles[x][y] };
            }
        }

        return ret;
    }

    private tiles: ITile[][] = [];

    constructor(public readonly height: number, public readonly width: number) {
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
