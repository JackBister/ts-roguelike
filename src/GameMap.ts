import { ITile } from "./Tile";

export class GameMap {
    private tiles: ITile[][] = [];

    constructor(private height: number, private width: number) {
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
