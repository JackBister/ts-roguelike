import { Entity } from "../Entity";

export class EntityService {
    public entities: Entity[] = [];

    public addEntity(e: Entity): void {
        if (this.entities.some((eo) => eo.id === e.id)) {
            throw new Error(`An Entity with ID === ${e.id} already exists!`);
        }
        this.entities.push(e);
    }

    public clearEntities(): void {
        this.entities = [];
    }

    public deleteEntityById(id: number): void {
        this.entities = this.entities.filter((e) => e.id !== id);
    }

    public getEntityById(id: number): Entity | undefined {
        return this.entities.find((e) => e.id === id);
    }

    public getEntityByName(name: string): Entity | undefined {
        return this.entities.find((e) => e.name === name);
    }

    public getEntitiesAtPos(x: number, y: number): Entity[] {
        return this.entities.filter((e) => e.isActive && e.x === x && e.y === y);
    }
}
