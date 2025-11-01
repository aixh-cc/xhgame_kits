
import { System } from "@aixh-cc/xhgame_ec_framework";
import { xhgame } from "../../xhgame";
;
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework";
// import { ILoadingvm } from "../../cocos/view/ui/common/LoadingView";

export interface ILoadingvm {
    /** tips */
    text: string
    /** 进度,1为100 */
    progress: number
}

export class LoadingViewCompSystem extends System {

    static async initComp(comp: LoadingViewComp) {
        console.log('xhgame.gui.enums.Loading')
        await xhgame.gui.openUIAsync(xhgame.gui.enums.Loading, comp)
        // comp.notify();
        comp.time_uuid = xhgame.timer.schedule(() => {
            comp.notify(); // 每秒钟更新进度
        }, 1000)
        // // 
        comp.total = 5 // 目前这里手动
        comp.finished = 0
        comp.vm.text = '加载环境资源'
        await xhgame.factory.actions.getTiledItemFactory().preloadItemsResource()
        comp.finished += 1
        comp.notify();
        comp.vm.text = '加载单位资源'
        await xhgame.factory.actions.getUnitItemFactory().preloadItemsResource()
        await xhgame.factory.actions.getUnitUiItemFactory().preloadItemsResource()
        comp.finished += 1
        comp.notify();
        comp.vm.text = '加载特效资源'
        await xhgame.factory.actions.getEffectItemFactory().getItemProduceDrive().preloadItemsResource()
        comp.finished += 1
        comp.notify();
        comp.vm.text = '加载ui资源'
        await xhgame.factory.actions.getUiItemFactory().preloadItemsResource()
        await xhgame.factory.actions.getTextUiItemFactory().preloadItemsResource()
        comp.finished += 1
        comp.notify();
        comp.vm.text = '开始初始化游戏'
        if (comp.otherPromise) {
            await comp.otherPromise()
        }
        comp.vm.text = '初始化完成'
        comp.finished += 1
        comp.notify();

    }
}

export class LoadingViewComp extends BaseModelComp {
    compName: string = 'LoadingViewComp'
    initBySystems: (typeof System)[] = [LoadingViewCompSystem]
    //
    otherPromise: () => Promise<void> = null
    time_uuid: string = ''
    vm: ILoadingvm = {
        text: '正在加载中',
        progress: 0
    }
    // 本comp内临时变量
    total: number = 10;
    _finished: number = 0
    get finished() {
        return this._finished
    }
    set finished(val) {
        this._finished = val
        this.vm.progress = Math.ceil(this.finished * 1000 / this.total) / 1000
    }
    reset() {
        this.otherPromise = null
        if (this.time_uuid != '') {
            xhgame.timer.unschedule(this.time_uuid) // 移除
        }
        this.time_uuid = ''
        this.vm = {
            text: '正在加载中',
            progress: 0.00,
        }
        this.total = 10
        this.finished = 0
    }

    setup(obj: { otherPromise: () => Promise<void> }) {
        this.otherPromise = obj.otherPromise
        return this
    }

    onDetach() {
        xhgame.gui.removeUI(xhgame.gui.enums.Loading)
    }
}