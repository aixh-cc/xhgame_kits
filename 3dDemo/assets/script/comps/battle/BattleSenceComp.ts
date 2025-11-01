import { BaseModelComp, System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "db://assets/script/xhgame"
import { BattleGameBoxComp } from "./BattleGameBoxComp"
import { BattleTiledComp } from "./BattleTiledComp"
import { BattleViewComp } from "./BattleViewComp"

export class BattleSenceSystem extends System {

    static async initComp(comp: BattleSenceComp) {
        xhgame.audio.playMusic(xhgame.audio.enums.MyGameBG)
        await xhgame.gameEntity.attachComponent(BattleGameBoxComp).done()
        await xhgame.gameEntity.attachComponent(BattleTiledComp).done()
        await xhgame.gameEntity.attachComponent(BattleViewComp).done()
    }
}

export class BattleSenceComp extends BaseModelComp {
    compName: string = 'BattleSenceComp'
    initBySystems: (typeof System)[] = [BattleSenceSystem]
    battleId: number = 0
    setup(obj: { battleId: number }) {
        this.battleId = obj.battleId
        return this
    }

    reset() {
        this.battleId = 0
    }

    actions = {

    }

    onDetach() {
        xhgame.gameEntity.detachComponent(BattleGameBoxComp)
        xhgame.gameEntity.detachComponent(BattleTiledComp)
        xhgame.gameEntity.detachComponent(BattleViewComp)
    }
}