import { Entity } from "./Entity";
import { GameMap } from "./GameMap";

export interface IGameMapOptions {
    height: number;
    width: number;

    roomMaxSize?: number;
    roomMinSize?: number;
    maxRooms?: number;
}

export const DEFAULT_OPTIONS: IGameMapOptions = {
    height: 45,
    width: 80,

    maxRooms: 30,
    roomMaxSize: 10,
    roomMinSize: 6,
};

export interface IMapGenerator {
    generate(opts: IGameMapOptions, player: Entity, dungeonLevel: number): GameMap;
}
