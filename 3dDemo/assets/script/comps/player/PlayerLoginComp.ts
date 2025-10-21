import { autoBindForDI, DI, System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"
import { SdkComp } from "../common/SdkComp"
import { PlayerModelComp } from "../models/PlayerModelComp"

export class PlayerLoginSystem extends System {
    static async initComp(comp: PlayerLoginComp) {
        const playerModelComp = DI.make<PlayerModelComp>('PlayerModelComp')
        let ret = await xhgame.gameEntity.getComponent(SdkComp).actions.login()
        await playerModelComp.actions.getAccount({
            code: ret.code,
            anonymousCode: ret.anonymousCode,
        })
        console.log('postPlayerEnter')
        await playerModelComp.actions.postPlayerEnter()
    }
}

export class PlayerLoginComp extends BaseModelComp {
    compName: string = 'PlayerLoginComp'
    initBySystems: (typeof System)[] = [PlayerLoginSystem]

    reset() {

    }
    actions = {

    }

    onDetach() {

    }
}