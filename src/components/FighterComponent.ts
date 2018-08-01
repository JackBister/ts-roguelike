import { IComponent } from "./Component";

export class FighterComponent implements IComponent {
    public id: number;
    public isActive: boolean = true;
    public readonly type: "FighterComponent" = "FighterComponent";

    public currHp: number;
    public baseMaxHp: number;

    constructor(public readonly ownerId: number,
                hp: number,
                public baseDefense: number,
                public basePower: number,
                public xp: number = 0,
    ) {
        this.currHp = hp;
        this.baseMaxHp = hp;
    }

}
