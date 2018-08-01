import { Component } from "./Component";

export class ComponentService {
    // TODO: private + getter
    public components: Component[] = [];

    public addComponent(c: Component): void {
        this.components.push(c);
    }

    public deleteComponentById(id: number): void {
        this.components = this.components.filter((c) => c.id !== id);
    }

    public deleteComponentByOwnerIdAndType(ownerId: number, type: string): void {
        this.components = this.components.filter((c) => c.ownerId !== ownerId || c.type !== type);
    }

    public getComponentById(id: number): Component {
        return this.components.find((c) => c.id === id);
    }

    public getComponentsForEntityId(id: number): Component[] {
        return this.components.filter((c) => c.ownerId === id);
    }

    public getComponentsForEntityIdAndType(id: number, type: string): Component[] {
        return this.components.filter((c) => c.ownerId === id && c.type === type);
    }

    public getComponentsForEntityIdAndTypes(id: number, types: string[]): Component[] {
        return this.components.filter((c) => c.ownerId === id && types.includes(c.type));
    }
}
