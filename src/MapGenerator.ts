import { Entity } from "./Entity";
import { GameMap } from "./GameMap";

export interface IGameMapOptions {
    height: number;
    width: number;

    roomMaxSize?: number;
    roomMinSize?: number;
    maxMonstersPerRoom?: number;
    maxRooms?: number;
}

export const DEFAULT_OPTIONS: IGameMapOptions = {
    height: 45,
    width: 80,

    maxMonstersPerRoom: 3,
    maxRooms: 30,
    roomMaxSize: 10,
    roomMinSize: 6,
};

export interface IMapGenerator {
    generate(opts: IGameMapOptions, player: Entity, entities: Entity[]): GameMap;
}
