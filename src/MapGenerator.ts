import { Entity } from "./Entity";
import { GameMap } from "./GameMap";

export interface IGameMapOptions {
    height: number;
    width: number;

    player?: Entity;

    roomMaxSize?: number;
    roomMinSize?: number;
    maxMonstersPerRoom?: number;
    maxRooms?: number;
}

export const DEFAULT_OPTIONS: IGameMapOptions = {
    height: 45,
    width: 80,

    player: null,

    maxMonstersPerRoom: 3,
    maxRooms: 30,
    roomMaxSize: 10,
    roomMinSize: 6,
};

export interface IMapGenerator {
    generate(opts: IGameMapOptions, entities: Entity[]): GameMap;
}
