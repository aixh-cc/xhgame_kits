
import { System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"
import { HelpComp } from "../common/HelpComp"
import { BattleGameBoxComp } from "./BattleGameBoxComp"

export class BattleViewSystem extends System {

    /** 初始化 */
    static async initComp(comp: BattleViewComp) {
        await xhgame.gui.openUIAsync(xhgame.gui.enums.Battle_Index, comp) // 游戏失利，等待复活
        comp.time_uuid = xhgame.timer.schedule(() => {
            this.secUpdate(comp)
        }, 1000)
        let obj = {
            round: 0,
            battle_id: 1,
            max_battle_id: 1
        }
        xhgame.event.emit('beforShowTarget', obj) // 手动触发新手指引事件
        xhgame.gameEntity.getComponent(HelpComp).actions.getResolveCallback('beforShowTarget', obj).then(() => {
            xhgame.gui.toast('显示目标')
        })
    }
    static secUpdate(comp: BattleViewComp) {
        const battleGameBoxComp = xhgame.gameEntity.getComponent(BattleGameBoxComp)
        // comp.playtimeFormat = this.formatTimeFromMs(battleGameBoxComp.gameBox.getGameTime())
        comp.notify()
    }

    static createEffectCenter(comp: BattleViewComp) {
        let item = xhgame.factory.actions.createEffectItem('huoyan') // arcane
        item.effectTime = 1
        item.toScene()
    }

}
export class BattleViewComp extends BaseModelComp {
    compName: string = 'BattleViewComp'
    initBySystems: (typeof System)[] = [BattleViewSystem]
    // 
    time_uuid: string = ''
    playtimeFormat: string = ''

    actions = {
        createEffectCenter: () => {
            BattleViewSystem.createEffectCenter(this)
        }
    }
    reset() {
        xhgame.timer.unschedule(this.time_uuid)
        this.time_uuid = ''
        this.playtimeFormat = ''
    }

    onDetach() {
        xhgame.gui.removeUI(xhgame.gui.enums.Battle_Index)
    }
}

