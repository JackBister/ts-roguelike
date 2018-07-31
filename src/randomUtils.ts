import { randomInt } from "./randomInt";

export function fromDungeonLevel(levelValueMap: Array<[number, number]>, currentLevel: number) {
    for (const t of levelValueMap) {
        if (currentLevel >= t[0]) {
            return t[1];
        }
    }
    return 0;
}

export function randomChoiceIndex(chances: number[]) {
    const randomChance = randomInt(0, chances.reduce((a, b) => a + b, 0));

    let runningSum = 0;
    let choice = 0;
    for (const w of chances) {
        runningSum += w;
        if (randomChance <= runningSum) {
            return choice;
        }
        choice += 1;
    }
    return choice;
}

interface IRandomMap {
    [key: string]: number;
}

export function randomChoiceFromMap(map: IRandomMap) {
    const choices = Object.keys(map);
    const chances = Object.values(map);

    return choices[randomChoiceIndex(chances)];
}
