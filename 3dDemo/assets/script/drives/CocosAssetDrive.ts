import { _decorator, AssetManager } from "cc";
import { xhgame } from "db://assets/script/xhgame";
import { DI, IAssetDrive, IAudioDrive } from "@aixh-cc/xhgame_ec_framework";
import { AudioEffect } from "db://xhgame_plugin/ccComponent/AudioEffect";
import { AudioMusic } from "db://xhgame_plugin/ccComponent/AudioMusic";

const { ccclass } = _decorator;

@ccclass('CocosAssetDrive')
export class CocosAssetDrive extends AssetManager implements IAssetDrive {

    assetManager: AssetManager

    loadBundle(nameOrUrl: string, onComplete: (err: Error | null, data: any) => void) {
        console.log(`[CocosAssetDrive] 开始加载Bundle: ${nameOrUrl}`);

        // 检查参数
        if (!nameOrUrl) {
            const error = new Error('Bundle名称不能为空');
            console.error(`[CocosAssetDrive] 参数错误:`, error);
            onComplete(error, null);
            return;
        }

        // 检查bundle是否已加载
        const existingBundle = this.assetManager.getBundle(nameOrUrl);
        if (existingBundle) {
            console.log(`[CocosAssetDrive] Bundle ${nameOrUrl} 已加载，直接返回`);
            onComplete(null, existingBundle);
            return;
        }

        // 尝试加载bundle
        console.log(`[CocosAssetDrive] 调用assetManager.loadBundle...`);
        this.assetManager.loadBundle(nameOrUrl, (err, bundle) => {
            console.log(`[CocosAssetDrive] assetManager.loadBundle回调执行`, {
                err: err,
                bundle: bundle,
                bundleType: typeof bundle,
                hasBundle: !!bundle
            });

            if (err) {
                console.error(`[CocosAssetDrive] 加载Bundle ${nameOrUrl} 失败:`, err);
                console.error(`[CocosAssetDrive] 错误详情:`, {
                    message: err.message,
                    stack: err.stack,
                    name: err.name
                });
                onComplete(err, null);
            } else if (!bundle) {
                const error = new Error(`Bundle ${nameOrUrl} 加载成功但返回值为空`);
                console.error(`[CocosAssetDrive] Bundle为空:`, error);
                onComplete(error, null);
            } else {
                console.log(`[CocosAssetDrive] 加载Bundle ${nameOrUrl} 成功:`, bundle);
                console.log(`[CocosAssetDrive] Bundle信息:`, {
                    name: bundle.name,
                    base: bundle.base,
                    deps: bundle.deps
                });
                onComplete(null, bundle);
            }
        });
    }
}