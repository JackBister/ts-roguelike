import { GameMap } from "./GameMap";
import { Entity } from "./Entity";

export interface GameMapOptions {
    height: number;
    width: number;

    player?: Entity;

    roomMaxSize?: number;
    roomMinSize?: number;
    maxMonstersPerRoom?: number;
    maxRooms?: number;
}

export const DEFAULT_OPTIONS: GameMapOptions = {
    height: 45,
    width: 80,

    player: null,

    roomMaxSize: 10,
    roomMinSize: 6,
    maxMonstersPerRoom: 3,
    maxRooms: 30
};

export interface MapGenerator {
    generate(opts: GameMapOptions, entities: Entity[]): GameMap;
}
