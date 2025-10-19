import { DI } from "@aixh-cc/xhgame_ec_framework";
import { CocosUiDrive } from "./drives/CocosUiDrive";
import { CocosAudioDrive } from "./drives/CocosAudioDrive";
import { MyCocosFactoryConfig } from "./managers/myFactory/MyCocosFactoryConfig";

export class CocosDrives {
    constructor() {
        DI.bindSingleton<CocosUiDrive>('IUiDrive', CocosUiDrive)
        DI.bindSingleton<CocosAudioDrive>('IAudioDrive', CocosAudioDrive)
        // 
        DI.bindSingleton<MyCocosFactoryConfig>('IFactoryDrive', MyCocosFactoryConfig)
    }
}

