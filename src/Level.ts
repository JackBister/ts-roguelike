import { Entity } from "./Entity";

export class Level {
    public static addXp(level: Level, xp: number) {
        level.currentXp += xp;

        if (level.currentXp > Level.xpToLevel(level)) {
            level.currentXp -= Level.xpToLevel(level);
            level.currentLevel++;
            return true;
        }
        return false;
    }

    public static xpToLevel(level: Level) {
        return level.levelUpBase + level.levelUpFactor * level.currentLevel;
    }

    public owner: Entity;

    constructor(public currentLevel: number = 1,
                public currentXp: number = 0,
                public levelUpBase: number = 200,
                public levelUpFactor: number = 150,
    ) { }

    public toJSON() {
        const ret = { ...(this as any) };
        ret.owner = undefined;
        ret._type = "Level";
        return ret;
    }
}
