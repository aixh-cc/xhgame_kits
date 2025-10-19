import { DI } from "@aixh-cc/xhgame_ec_framework";
import { TestUiDrive } from "./test/drive/TestUiDrive";
import { TestAudioDrive } from "./test/drive/TestAudioDrive";
// import { AssetManager, assetManager } from "cc";

export class TestDrives {
    constructor() {
        DI.bindSingleton<TestUiDrive>('IUiDrive', TestUiDrive)
        DI.bindSingleton<TestAudioDrive>('IAudioDrive', TestAudioDrive)

        // 
        // DI.bindSingleton<AssetManager>('AssetManager', assetManager)
    }
}

