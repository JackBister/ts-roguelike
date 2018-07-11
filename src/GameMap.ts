import { Tile } from "./Tile";

export class GameMap {
    constructor(private height: number, private width: number) {
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

    private tiles: Tile[][] = [];
}
