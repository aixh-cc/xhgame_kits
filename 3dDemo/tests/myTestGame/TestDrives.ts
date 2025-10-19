import { DI } from "@aixh-cc/xhgame_ec_framework";
import { TestUiDrive } from "./test/drive/TestUiDrive";
import { TestAudioDrive } from "./test/drive/TestAudioDrive";
import { MyTestFactoryConfig } from "./MyTestFactoryConfig";
// import { AssetManager, assetManager } from "cc";

export class TestDrives {
    constructor() {
        DI.bindSingleton<TestUiDrive>('IUiDrive', TestUiDrive)
        DI.bindSingleton<TestAudioDrive>('IAudioDrive', TestAudioDrive)

        DI.bindSingleton<MyTestFactoryConfig>('IFactoryDrive', MyTestFactoryConfig)

        // 
        // DI.bindSingleton<AssetManager>('AssetManager', assetManager)
    }
}

