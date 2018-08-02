import { GameMap } from "../GameMap";

export class MapService {
    public maps: GameMap[] = [];

    private currentMapId: number = 1;

    public addMap(map: GameMap): void {
        this.maps.push(map);
    }

    public clearMaps(): void {
        this.maps = [];
    }

    public getCurrentMap(): GameMap {
        return this.maps.find((m) => m.id === this.currentMapId);
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

    public loadMaps(maps: GameMap[]) {
        this.maps = maps;
    }

    public setCurrentMap(id: number): void {
        if (id < 0 || !this.maps.some((m) => m.id === id)) {
            throw new Error("Map ID out of range!");
        }
        this.currentMapId = id;
    }
}
