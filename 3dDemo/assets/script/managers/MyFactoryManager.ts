import { DI, FactoryManager, IFactoryConfig } from "@aixh-cc/xhgame_ec_framework"
import { MyFactoryActions } from "./myFactory/MyFactoryActions"
// import { MyCocosFactoryConfig } from "./myFactory/MyCocosFactoryConfig"

export class MyFactoryManager extends FactoryManager<IFactoryConfig> {

    constructor() {
        super(DI.make('IFactoryDrive'))
    }
    /** 快速操作 */
    private _myFactoryActions: MyFactoryActions = null
    get actions() {
        if (this._myFactoryActions == null) {
            this._myFactoryActions = new MyFactoryActions()
        }
        return this._myFactoryActions
    }
}