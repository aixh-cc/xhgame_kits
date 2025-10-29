import { Label, _decorator } from 'cc';
import { CCInteger } from 'cc';
import { CCString } from 'cc';
import { xhgame } from 'db://assets/script/xhgame';
import { BYTEDANCE } from 'cc/env';
import { CocosBaseView } from 'db://xhgame_plugin/Ui/CocosBaseView';
import { GateViewComp } from '../../comps/gate/GateViewComp';
import { CCFloat } from 'cc';
import { ProgressBar } from 'cc';
import { CCBoolean } from 'cc';

const { ccclass, property } = _decorator;

export interface ILoadResourceViewVM {
    progress: number,
}
/**
 * gate界面
 */
@ccclass('FirstUiView')
export class FirstUiView extends CocosBaseView implements ILoadResourceViewVM {

    /** 加载资源进度 */
    @property
    _progress: number = 0;
    @property({ type: CCFloat, visible: true })
    get progress() {
        return this._progress
    }
    set progress(val) {
        this._progress = val
        console.log('set progress val', val)
        this.node.getChildByPath('ProgressBar').getComponent(ProgressBar).progress = val
    }

    /** 加载资源进度 */
    @property
    _isLoadResFinished: boolean = false;
    @property({ type: CCBoolean, visible: true })
    get isLoadResFinished() {
        return this._isLoadResFinished
    }
    set isLoadResFinished(val) {
        this._isLoadResFinished = val
        // this.node.active = val
    }

    // private _is_load_resource: boolean = false
    // set is_load_resource(val: boolean) {
    //     console.log('is_load_resource', val)
    //     if (this._is_load_resource == false) {
    //         this._is_load_resource = val
    //         this.load_resource()
    //     }
    // }
    reset(): void {
        this.progress = 0
        this.isLoadResFinished = false
        // this.is_load_resource = false
    }

    protected onLoad(): void {
        this.setBindAttrMap({
            "progress": 'LoadResourceToGateComp::vm.resValue',
            "isLoadResFinished": 'LoadResourceToGateComp::vm.isLoadResFinished',
        })
    }
}