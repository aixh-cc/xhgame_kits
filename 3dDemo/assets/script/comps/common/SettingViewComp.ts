
import { System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"

export interface ISettingViewVM {
    music_open: boolean
    effect_open: boolean
}

export class SettingViewSystem extends System {
    /** 初始化 */
    static async initComp(comp: SettingViewComp) {
        await xhgame.gui.openUIAsync(xhgame.gui.enums.Setting, comp) // 游戏失利，等待复活
        comp.vm.effect_open = xhgame.audio.getEffectVolume() > 0
        comp.vm.music_open = xhgame.audio.getMusicVolume() > 0
        comp.notify()
    }
}

export class SettingViewComp extends BaseModelComp {
    compName: string = 'SettingViewComp'
    initBySystems: (typeof System)[] = [SettingViewSystem]
    vm: ISettingViewVM = null
    actions = {

    }
    reset() {
        this.vm = null
    }
    onDetach() {
        xhgame.gui.removeUI(xhgame.gui.enums.Setting)
    }
}

