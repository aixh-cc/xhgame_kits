import { DI, FetchHttp, Websocket } from "@aixh-cc/xhgame_ec_framework";
import { TestUiDrive } from "./test/drive/TestUiDrive";
import { TestAudioDrive } from "./test/drive/TestAudioDrive";
import { MyTestFactoryConfig } from "./MyTestFactoryConfig";
import { TestAssetDrive } from "./test/drive/TestAssetDrive";

export class TestDrives {
    constructor() {
        DI.bindSingleton<TestAssetDrive>('IAssetDrive', TestAssetDrive)
        DI.bindSingleton<TestUiDrive>('IUiDrive', TestUiDrive)
        DI.bindSingleton<TestAudioDrive>('IAudioDrive', TestAudioDrive)
        DI.bindSingleton<FetchHttp>('IHttp', FetchHttp)
        DI.bindSingleton<Websocket>('ISocket', Websocket)
        DI.bindSingleton<MyTestFactoryConfig>('IFactoryConfig', MyTestFactoryConfig)
    }
}

