import { _decorator, assetManager, AssetManager, Component, director, instantiate, Node, Prefab } from "cc";
import { xhgame } from "db://assets/script/xhgame";
import { DI, IAssetDrive, IAudioDrive } from "@aixh-cc/xhgame_ec_framework";
import { AudioEffect } from "db://xhgame_plugin/ccComponent/AudioEffect";
import { AudioMusic } from "db://xhgame_plugin/ccComponent/AudioMusic";

const { ccclass } = _decorator;

@ccclass('CocosAssetDrive')
export class CocosAssetDrive extends AssetManager implements IAssetDrive {
    loadBundle(nameOrUrl: string, onComplete: (err: Error, data: any) => void) {
        assetManager.loadBundle(nameOrUrl, onComplete);
    }
}