import { BaseModelComp, Entity } from "@aixh-cc/xhgame_ec_framework";
import { PlayerModelComp } from "./comps/models/PlayerModelComp";
import { PlayerMissionModelComp } from "./comps/models/PlayerMissionModelComp";
/**
 * 游戏实体
 */
export class GameEntity extends Entity {

    // 需要在这里挂载注册模型组件
    init(): void {
        this.attachComponent(PlayerModelComp)
        this.attachComponent(PlayerMissionModelComp)
    }

    getComponentSafe<T extends BaseModelComp>(ModelClass: new () => T) {
        let has = this.getComponent(ModelClass)
        if (has) {
            return has
        }
        return this.attachComponent(ModelClass)
    }
}
