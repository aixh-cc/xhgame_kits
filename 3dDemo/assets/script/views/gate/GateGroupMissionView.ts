import { _decorator } from "cc";
import { CocosBaseView } from "db://xhgame_plugin/Ui/CocosBaseView";
import { GateGroupMissionViewComp } from "../../comps/gate/GateGroupMissionViewComp";

const { ccclass, property } = _decorator;

@ccclass('GateGroupMissionView')
export class GateGroupMissionView extends CocosBaseView {
    viewModelComp: GateGroupMissionViewComp;
    reset(): void {

    }
    chooseSelectedToPlay() {
        this.viewModelComp.actions.chooseSelectedToPlay()
    }
}