import { System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"
import { ITiledItem, IUnitItem } from "../../managers/myFactory/MyFactorys"

export class BattleTiledSystem extends System {

    static async initComp(comp: BattleTiledComp) {
        // 创建地图
        comp.mainTiled = xhgame.factory.actions.createTiledItem('nongchangdao')
        comp.mainTiled.toScene()

        // 创建地板
        // let max_index = comp.width * comp.height
        // for (let i = 0; i < max_index; i++) {
        //     let _item = xhgame.factory.actions.createTiledItem('tiled')
        //     let pos_arr = this.getWorldPositionsByGridIndex(comp, i)
        //     _item.positions = pos_arr
        //     _item.toScene()
        //     comp.tiledItems.push(_item)
        // }
    }
}

export class BattleTiledComp extends BaseModelComp {
    compName: string = 'BattleTiledComp'
    initBySystems: (typeof System)[] = [BattleTiledSystem]
    /** 地板 */
    tiledItems: ITiledItem[] = []
    mainTiled: ITiledItem = null
    reset() {
        for (let i = 0; i < this.tiledItems.length; i++) {
            const element = this.tiledItems[i];
            element.toPool()
        }
        this.tiledItems = []
        this.mainTiled.toPool()
        this.mainTiled = null
    }

    actions = {

    }

    onDetach() {

    }
}