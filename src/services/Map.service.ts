import { GameMap } from "../GameMap";

export class MapService {
    private _maps: GameMap[] = [];

    private currentMapId: number = 0;
    private mapId: number = 0;

    public addMap(map: GameMap): void {
        map.id = this.mapId++;
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

    public setCurrentMap(id: number): void {
        if (id < 0 || id > this.mapId) {
            throw new Error("Map ID out of range!");
        }
        this.currentMapId = id;
    }

    public get maps() {
        return this._maps;
    }
}
