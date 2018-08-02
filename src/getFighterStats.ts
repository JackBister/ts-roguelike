import { container } from "./config/container";
import { GetPropertyEvent } from "./events/GetPropertyEvent";
import { sumPropertyEvents } from "./sumPropertyEvents";
import { SystemService } from "./systems/System.service";

const systemService = container.get<SystemService>("SystemService");

export function getFighterStats(entityId: number) {
    const maxHp = sumPropertyEvents(
        systemService.dispatchEvent(entityId, new GetPropertyEvent("maxHp")),
    );
    const power = sumPropertyEvents(
        systemService.dispatchEvent(entityId, new GetPropertyEvent("power")),
    );
    const defense = sumPropertyEvents(
        systemService.dispatchEvent(entityId, new GetPropertyEvent("defense")),
    );

    return {
        defense: defense,
        maxHp: maxHp,
        power: power,
    };
}
