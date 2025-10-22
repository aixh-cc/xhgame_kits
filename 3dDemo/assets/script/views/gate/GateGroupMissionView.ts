import { _decorator, Node, v3, Vec3 } from "cc";
// import { BaseView } from "../../../../../../extensions/xhgame-plugin-framework/assets/ccComponent/BaseView";
// import { GateGroupMissionComp } from "../../../../severs/gate/GateGroupMissionComp";
import { CocosBaseView } from "db://xhgame_plugin/Ui/CocosBaseView";
import { GateGroupMissionViewComp } from "../../comps/gate/GateGroupMissionViewComp";

const { ccclass, property } = _decorator;

@ccclass('GateGroupMissionView')
export class GateGroupMissionView extends CocosBaseView {
    reset(): void {

    }

    protected onLoad(): void {

    }

    protected onEnable(): void {


    }

    protected onDisable(): void {

    }

    chooseSelectedToPlay() {
        let comp = this.viewModelComp as GateGroupMissionViewComp
        comp.actions.chooseSelectedToPlay()
    }

}