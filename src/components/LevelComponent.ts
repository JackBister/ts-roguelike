import { IComponent } from "./Component";

export class LevelComponent implements IComponent {
    public static addXp(level: LevelComponent, xp: number) {
        level.currentXp += xp;

        if (level.currentXp > LevelComponent.xpToLevel(level)) {
            level.currentXp -= LevelComponent.xpToLevel(level);
            level.currentLevel++;
            return true;
        }
        return false;
    }

    public static xpToLevel(level: LevelComponent) {
        return level.levelUpBase + level.levelUpFactor * level.currentLevel;
    }

    public id: number;
    public isActive: boolean = true;
    public readonly type: "LevelComponent" = "LevelComponent";

    constructor(public readonly ownerId: number,
                public currentLevel: number = 1,
                public currentXp: number = 0,
                public levelUpBase: number = 200,
                public levelUpFactor: number = 150) { }
}
