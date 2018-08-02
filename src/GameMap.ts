import { ITile } from "./Tile";

export class GameMap {
    public static getTile(m: GameMap, x: number, y: number) {
        if (x < 0 || x >= m.width || y < 0 || y >= m.height) {
            return null;
        }
        return m.tiles[x][y];
    }

    public static isBlocked(m: GameMap, x: number, y: number) {
        const tile = GameMap.getTile(m, x, y);
        return !tile || tile.isBlocked;
    }

    private tiles: ITile[][] = [];

    constructor(
        public readonly height: number,
        public readonly width: number,
        public readonly dungeonLevel = 1,
        public id: number,
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
}
