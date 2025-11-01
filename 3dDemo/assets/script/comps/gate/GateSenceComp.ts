import { System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"
import { GateViewComp } from "./GateViewComp"

export class GateSenceComp extends BaseModelComp {
    compName: string = 'GateSenceComp'
    initBySystems = [GateSenceSystem]
    reset() {
    }
    actions = {
    }
    onDetach() {
        xhgame.gameEntity.detachComponent(GateViewComp)
    }
}

export class GateSenceSystem extends System {
    static async initComp(comp: GateSenceComp) {
        await xhgame.gameEntity.attachComponent(GateViewComp).done()
        // 加载gate场景中可能用到的工厂及资源
        // uiItemFactory
        await xhgame.factory.actions.getUiItemFactory().preloadItemsResource()
        await xhgame.factory.actions.getTextUiItemFactory().preloadItemsResource()

    }
}

