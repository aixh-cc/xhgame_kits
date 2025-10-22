import { AssetManager, DI, IAssetDrive, IBundle } from "@aixh-cc/xhgame_ec_framework"
import { assetManager } from "cc"

export class MyAssetManager<T extends IAssetDrive> extends AssetManager<T> {
    constructor() {
        super(null)
        // super(DI.make('IAssetDrive'))
    }
    loadBundle<T extends IBundle>(nameOrUrl: string, onComplete?: (err: Error, data: T) => void): void {
        assetManager.loadBundle(nameOrUrl, onComplete)
    }
    // get enums() {

    // }
}

// enum AudioEnums {
//     Chose = 'bundle_game://audio/shengli',
//     ShengLi = 'bundle_game://audio/shengli',
//     ShiBai = 'bundle_game://audio/shibai',
//     //
//     BingDong = 'bundle_game://audio/skill_wuxing_3',
//     MyGameBG = 'bundle_game://audio/mygamebg',
//     QingBg = 'bundle_game://audio/qingbg',
// }