import { CCFloat, ProgressBar, CCBoolean, _decorator } from 'cc';
import { CocosBaseView } from 'db://xhgame-plugin-framework/Ui/CocosBaseView';
import { ILoadResourceToGateViewVM } from '../../comps/enter/LoadResourceToGateComp';

const { ccclass, property } = _decorator;

/**
 * gate界面
 */
@ccclass('FirstUiView')
export class FirstUiView extends CocosBaseView implements ILoadResourceToGateViewVM {

    /** 加载资源进度 */
    @property
    _progress: number = 0;
    @property({ type: CCFloat, visible: true })
    get progress() {
        return this._progress
    }
    set progress(val) {
        this._progress = val
        this.node.getChildByPath('ProgressBar').getComponent(ProgressBar).progress = val
    }

    /** 加载资源进度 */
    @property
    _isFinished: boolean = false;
    @property({ type: CCBoolean, visible: true })
    get isFinished() {
        return this._isFinished
    }
    set isFinished(val) {
        this._isFinished = val
        this.node.active = !val // 完成后隐藏
    }

    reset(): void {
        this.progress = 0
        this.isFinished = false
    }

    protected onLoad(): void {
        this.setBindAttrMap({
            "progress": 'LoadResourceToGateComp::vm.progress',
            "isFinished": 'LoadResourceToGateComp::vm.isFinished',
        })
    }
}