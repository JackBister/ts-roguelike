import { GameMap } from "../GameMap";

export class MapService {
    private _maps: GameMap[] = [];

    private currentMapId: number = 0;

    public addMap(map: GameMap): void {
        this._maps.push(map);
    }

    public clearMaps(): void {
        this._maps = [];
    }

    public getCurrentMap(): GameMap {
        return this._maps[this.currentMapId];
    }

    public getCurrentMapId(): number {
        return this.currentMapId;
    }

    public getMaxMapId(): number {
        if (this.maps.length === 0) {
            return 0;
        }
        return Math.max(...this.maps.map((m) => m.id));
    }

    public setCurrentMap(id: number): void {
        if (id < 0 || !this.maps.some((m) => m.id === id)) {
            throw new Error("Map ID out of range!");
        }
        this.currentMapId = id;
    }

    public get maps() {
        return this._maps;
    }
}
