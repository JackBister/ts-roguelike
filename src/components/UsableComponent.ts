import { IComponent } from "./Component";

export class UsableComponent implements IComponent {
    public id: number;
    public isActive: boolean = true;
    public readonly type: "UsableComponent" = "UsableComponent";

    public constructor(public readonly ownerId: number,
                       public readonly requiresTargeting: boolean,
                       public readonly useFunction: string) { }

}
