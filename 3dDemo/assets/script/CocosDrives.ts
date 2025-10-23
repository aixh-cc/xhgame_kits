import { DI, FetchHttp, Websocket } from "@aixh-cc/xhgame_ec_framework";
import { CocosUiDrive } from "./drives/CocosUiDrive";
import { CocosAudioDrive } from "./drives/CocosAudioDrive";
import { MyCocosFactoryConfig } from "./managers/myFactory/MyCocosFactoryConfig";
import { AssetManager, assetManager } from "cc";

export class CocosDrives {
    constructor() {
        DI.bindInstance<AssetManager>('IAssetDrive', assetManager) // 注意这里是用实例，不是类
        DI.bindSingleton<CocosUiDrive>('IUiDrive', CocosUiDrive)
        DI.bindSingleton<CocosAudioDrive>('IAudioDrive', CocosAudioDrive)
        DI.bindSingleton<FetchHttp>('IHttp', FetchHttp)
        DI.bindSingleton<Websocket>('ISocket', Websocket)
        DI.bindSingleton<MyCocosFactoryConfig>('IFactoryConfig', MyCocosFactoryConfig)
    }
}

