import { inject, injectable } from "inversify";
import * as ROT from "rot-js";
import { MapService } from "./Map.service";

@injectable()
export class FovService {

    private fov: ROT.FOV;

    constructor(
        @inject("MapService") private maps: MapService,
    ) {
        this.fov = new ROT.FOV.PreciseShadowcasting(
            (x, y) => {
                const currentMap = this.maps.getCurrentMap();
                if (x < 0 || x >= currentMap.width
                    || y < 0 || y >= currentMap.height) {
                    return false;
                }
                return !currentMap.getTile(x, y).blocksSight;
            },
        );
    }

    public computeFov<T>(x: number, y: number, range: number, callback: (xi: number, yi: number) => T): T[] {
        const results: T[] = [];

        this.fov.compute(x, y, range, (xi, yi) => {
            const result = callback(xi, yi);
            results.push(result);
        });

        return results;
    }
}
