
import { System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"
// import { LoadingViewComp } from "../common/LoadingViewComp"
// import { BattleSenceComp } from "../battle/BattleSenceComp"
import { GateSenceComp } from "./GateSenceComp"
import { BattleModelComp } from "../models/BattleModelComp"
import { LoadingViewComp } from "./LoadingViewComp"
import { BattleSenceComp } from "../battle/BattleSenceComp"

export class GateToBattleSystem extends System {

    static async initComp(comp: GateToBattleComp) {
        const battleModel = xhgame.gameEntity.getComponent(BattleModelComp)
        if (comp.battleId != battleModel.curBattleTableItem.id) {
            return console.error('battleId 不一致')
        }
        await xhgame.gameEntity.attachComponent(LoadingViewComp).setup({
            otherPromise: async () => {
                // await xhgame.gameEntity.attachComponent(BattleSenceComp).setup({ battleId: comp.battleId }).done()
            }
        }).done()
        xhgame.gameEntity.detachComponent(LoadingViewComp)
        xhgame.gameEntity.detachComponent(GateSenceComp)
    }

}

export class GateToBattleComp extends BaseModelComp {
    compName: string = 'GateToBattleComp'
    initBySystems: (typeof System)[] = [GateToBattleSystem]
    // 
    battleId: number = 0
    reset() {
        this.battleId = 0
    }
    setup(obj: { battleId: number }): GateToBattleComp {
        this.battleId = obj.battleId
        return this
    }
    onDetach() {

    }
}