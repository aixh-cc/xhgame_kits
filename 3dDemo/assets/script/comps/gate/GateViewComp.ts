import { DI, System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"
import { PlayerModelComp } from "../models/PlayerModelComp"
import { SettingViewComp } from "../common/SettingViewComp"
import { GateGroupMissionViewComp } from "./GateGroupMissionViewComp"

export class GateViewSystem extends System {

    static async initComp(comp: GateViewComp) {
        await xhgame.gui.openUIAsync(xhgame.gui.enums.Gate_Index, comp)
        // 为了调试，加入调试界面
        await xhgame.gui.openUIAsync(xhgame.gui.enums.Dev_Index, comp)

        xhgame.audio.playMusic(xhgame.audio.enums.QingBg)
    }

    /** 从gate进入战役 */
    static async startBattle(comp: GateViewComp) {
        const playerModel = DI.make<PlayerModelComp>('PlayerModelComp')
        let battleId = playerModel.selectedBattleId

        // 
        // const curBattle = xhgame.table.getTable(xhgame.table.enums.battle).getInfo(battleId)
        // if (curBattle == undefined) {
        //     xhgame.gui.toast('未找到该关卡信息，敬请期待')
        //     return
        // }
        // xhgame.gameEntity.battleModel.reset()
        // xhgame.gameEntity.battleModel.curBattleTableItem = JSON.parse(JSON.stringify(curBattle))
        // console.log('GateToBattleComp')
        // await xhgame.gameEntity.attachComponent(GateToBattleComp).setup({ battleId: battleId }).done()
        // xhgame.gameEntity.detachComponent(GateToBattleComp)
    }

    static openGateGroupMission(comp: GateViewComp) {
        xhgame.gameEntity.attachComponent(GateGroupMissionViewComp)
    }

    static openSettingDialog(comp: GateViewComp) {
        xhgame.gameEntity.attachComponent(SettingViewComp)
    }
}


export class GateViewComp extends BaseModelComp {
    compName: string = 'GateViewComp'
    initBySystems = [GateViewSystem]
    reset() {

    }
    // 在gate场景,玩家的操作
    actions = {
        /** 开始游戏 */
        startBattle: () => {
            return GateViewSystem.startBattle(this)
        },
        /** 打开关卡 */
        openGateGroupMission: () => {
            return GateViewSystem.openGateGroupMission(this)
        },
        /** 打开设置 */
        openSettingDialog: () => {
            GateViewSystem.openSettingDialog(this)
        },
    }

    onDetach() {
        xhgame.gui.removeUI(xhgame.gui.enums.Gate_Index)
    }
}
