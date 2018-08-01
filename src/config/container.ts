import { Container } from "inversify";
import { ComponentService } from "../components/Component.service";
import { EntityService } from "../entities/Entity.service";
import { FovService } from "../services/Fov.service";
import { MapService } from "../services/Map.service";
import { AiSystem } from "../systems/AiSystem";
import { FighterSystem } from "../systems/FighterSystem";
import { LevelSystem } from "../systems/LevelSystem";
import { SystemService } from "../systems/System.service";

export const container = new Container();
container.bind<ComponentService>("ComponentService").toConstantValue(new ComponentService());
container.bind<EntityService>("EntityService").toConstantValue(new EntityService());
container.bind<SystemService>("SystemService").toConstantValue(new SystemService());

container.bind<MapService>("MapService").toConstantValue(new MapService());
container.bind<FovService>("FovService").toConstantValue(new FovService(container.get("MapService")));

const systemService = container.get<SystemService>("SystemService");
systemService.addSystem(container.resolve(AiSystem));
systemService.addSystem(container.resolve(FighterSystem));
systemService.addSystem(container.resolve(LevelSystem));
