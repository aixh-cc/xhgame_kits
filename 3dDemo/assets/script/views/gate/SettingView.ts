import { _decorator } from "cc";
import { xhgame } from "db://assets/script/xhgame";
import { CCBoolean } from "cc";
import { CocosBaseView } from "db://xhgame-plugin-framework/Ui/CocosBaseView";
import { ISettingViewVM } from "../../comps/common/SettingViewComp";

const { ccclass, property } = _decorator;

@ccclass('SettingView')
export class SettingView extends CocosBaseView implements ISettingViewVM {
    reset(): void {

    }
    /** 音乐开关 */
    @property
    _music_open: boolean = true
    @property({
        type: CCBoolean
    })
    get music_open() {
        return this._music_open
    }
    set music_open(val) {
        this._music_open = val
        let numval = val ? 1 : 0
        let chs = this.node.getChildByName('musics').children
        for (let i = 0; i < chs.length; i++) {
            const _node = chs[i];
            if (numval == i) {
                _node.active = true
            } else {
                _node.active = false
            }
        }
    }
    /** 音效开关 */
    @property
    _effect_open: boolean = true
    @property({
        type: CCBoolean
    })
    get effect_open() {
        return this._effect_open
    }
    set effect_open(val) {
        this._effect_open = val
        let numval = val ? 1 : 0
        let chs = this.node.getChildByName('effects').children
        for (let i = 0; i < chs.length; i++) {
            const _node = chs[i];
            if (numval == i) {
                _node.active = true
            } else {
                _node.active = false
            }
        }
    }
    protected onLoad(): void {
        this.setBindAttrMap({
            "music_open": 'SettingViewComp::vm.music_open',
            "effect_open": 'SettingViewComp::vm.effect_open',
        })
    }

    onMusicBtnClick() {
        this.music_open = !this.music_open
        let numval = this.music_open ? 1 : 0
        xhgame.audio.setMusicVolume(numval)
    }

    onEffectBtnClick() {
        this.effect_open = !this.effect_open
        let numval = this.effect_open ? 1 : 0
        xhgame.audio.setEffectVolume(numval)
    }
}