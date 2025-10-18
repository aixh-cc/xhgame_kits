import { DI } from "@aixh-cc/xhgame_ec_framework";
import { CocosUiDrive } from "./drives/CocosUiDrive";

export class CocosDrives {

    constructor() {
        DI.bindSingleton<CocosUiDrive>('IUiDrive', CocosUiDrive)
    }



}

