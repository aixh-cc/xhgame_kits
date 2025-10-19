
import { System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"
import { TableType } from "../../managers/MyTableManager"

export class LoadResourceToGateSystem extends System {

    static async initComp(comp: LoadResourceToGateComp) {
        // 这个是唯一直接已挂载在root上的
        await this.load_resource(comp)
        // xhgame.event.emit('load_resource')
        // comp.viewVM.is_load_resource = true
        // comp.notify()
        // await this.loadFinished(comp)
    }

    static load_resource(comp: LoadResourceToGateComp) {
        return new Promise((resolve, reject) => {
            xhgame.asset.loadBundle('bundle_gate', async (err, bundle: any) => {
                await this.load_gui(comp, bundle)
                await this.load_json(comp, bundle)
                comp.vm.resValue = 1;
                comp.vm.isLoadResFinished = false;
                // const comp = xhgame.gameEntity.getComponent(LoadResourceViewComp)
                // comp.loadFinishedCallback && comp.loadFinishedCallback()
                resolve(true)
            })
        })
    }
    static async load_gui(comp: LoadResourceToGateComp, bundle: any) {
        return new Promise((resolve, reject) => {
            bundle.loadDir('gui', (finished: number, total: number) => {
                console.log(`gui加载资源进度: ${finished}/${total}`);
                comp.vm.resValue = finished / total;
            }, (err, assets) => {
                if (err) {
                    console.error('加载资源失败', err);
                    return;
                }
                console.log('gui加载资源成功', assets);
                resolve(true)
            });
        })
    }
    static async load_json(comp: LoadResourceToGateComp, bundle: any) {
        return new Promise((resolve, reject) => {
            bundle.loadDir('config', (finished: number, total: number) => {
                console.log(`json加载资源进度: ${finished}/${total}`);
            }, (err, assets) => {
                if (err) {
                    console.error('加载资源失败', err);
                    return;
                }
                console.log('json加载资源成功', assets);
                for (let i = 0; i < assets.length; i++) {
                    const _asset = assets[i] as any;
                    let _table = xhgame.table.getTable(assets[i].name as TableType)
                    if (_table != undefined) {
                        _table.init(_asset.json)
                    }
                }
                comp.vm.resValue = 1;
                comp.vm.isLoadResFinished = false;
                resolve(true)
            });
        })
    }
    // static loadFinished(comp: LoadResourceToGateComp) {
    //     return new Promise((resolve, reject) => {
    //         comp.loadFinishedCallback = resolve
    //     })
    // }
}
export interface ILoadResourceToGateViewVM {
    resValue: number,
    isLoadResFinished: boolean,
}
export class LoadResourceToGateComp extends BaseModelComp {
    compName: string = 'LoadResourceToGateComp'
    initBySystems: (typeof System)[] = [LoadResourceToGateSystem]
    loadFinishedCallback: Function = null
    vm: ILoadResourceToGateViewVM = {
        resValue: 0,
        isLoadResFinished: false,
        // is_load_resource: false
    }
    reset() {
        this.loadFinishedCallback = null
    }

    actions = {

    }

    onDetach() {

    }
}