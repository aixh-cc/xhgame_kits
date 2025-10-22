
import { System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"

export class SettingViewSystem extends System {
    /** 初始化 */
    static async initComp(comp: SettingViewComp) {
        await xhgame.gui.openUIAsync(xhgame.gui.enums.Setting, comp) // 游戏失利，等待复活
    }
}

export class SettingViewComp extends BaseModelComp {
    compName: string = 'SettingViewComp'
    initBySystems: (typeof System)[] = [SettingViewSystem]
    actions = {

    }
    reset() {

    }

    onDetach() {
        xhgame.gui.removeUI(xhgame.gui.enums.Setting)
    }
}

