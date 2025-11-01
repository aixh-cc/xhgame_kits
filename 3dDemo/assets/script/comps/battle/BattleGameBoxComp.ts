import { System } from "@aixh-cc/xhgame_ec_framework"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"

export class BattleGameBoxSystem extends System {

    static async initComp(comp: BattleGameBoxComp) {


    }

}

export class BattleGameBoxComp extends BaseModelComp {
    compName: string = 'BattleGameBoxComp'
    initBySystems: (typeof System)[] = [BattleGameBoxSystem]

    // gameBox: ShapAtGridsLogic = null // todo
    // gameBoxDrive: LogicDrive = null

    reset() {

    }

    actions = {

    }

    onDetach() {

    }
}