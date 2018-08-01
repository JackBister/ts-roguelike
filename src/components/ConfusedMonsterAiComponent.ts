import { IComponent } from "./Component";

export class ConfusedMonsterAiComponent implements IComponent {
    public id: number;
    public isActive: boolean = true;
    public readonly type: "ConfusedMonsterAiComponent" = "ConfusedMonsterAiComponent";

    constructor(public readonly ownerId: number, public numTurns: number, public previousAiId: number) {}
}
