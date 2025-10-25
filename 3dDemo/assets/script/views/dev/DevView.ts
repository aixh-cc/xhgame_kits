import { Label, _decorator } from 'cc';
import { CocosBaseView } from 'db://xhgame_plugin/Ui/CocosBaseView';
import { xhgame } from '../../xhgame';

const { ccclass, property } = _decorator;

@ccclass('DevView')
export class DevView extends CocosBaseView {
    reset(): void {

    }

    test_toast() {
        xhgame.gui.toast('测试')
    }
}