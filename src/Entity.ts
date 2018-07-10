
export let entities: Entity[] = [];

export interface Entity {
    x: number;
    y: number;

    color: string;
    symbol: string;

    isBlocking: boolean;
    name: string;
};
