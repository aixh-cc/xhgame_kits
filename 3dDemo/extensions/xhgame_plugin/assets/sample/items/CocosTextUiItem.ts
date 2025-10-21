import { CCString, Node } from "cc";
import { _decorator, Animation, Component, instantiate, Label, Prefab, v3 } from "cc"
import { BaseCocosItem } from "./BaseCocosItem";
import { IItemProduceDrive } from "@aixh-cc/xhgame_ec_framework";
import { ITextUiItem } from "./consts/Interfaces";
import { xhgame } from "db://assets/script/xhgame";

const { ccclass, property } = _decorator;

@ccclass('CocosTextUiItem')
export class CocosTextUiItem extends BaseCocosItem implements ITextUiItem {
    static className = 'CocosTextUiItem'
    @property
    _content: string = ''
    @property({ type: CCString, visible: true })
    get content() {
        return this._content
    }
    set content(val) {
        this._content = val
        this.getComponentInChildren(Label).string = val
    }
    /** 播放时间(秒) */
    playTime: number = 0
    playEndCallback: Function = null
    reset() {
        this.content = ''
        this.playTime = 0
        this.playEndCallback = null
    }
    clone() {

    }
    toScene(): void {
        this.node.setPosition(v3(...this.positions))
        const gui_root = xhgame.gui.gui_root as Node
        gui_root.addChild(this.node)
        requestAnimationFrame(() => {
            let _anim = this.node.getChildByName('modelBody').getComponentInChildren(Animation)
            _anim.play(this.itemNo);
            xhgame.timer.scheduleOnce(() => {
                this.playEndCallback && this.playEndCallback()
                _anim.stop();
                this.toPool()
            }, this.playTime * 1000)
        })
    }
    toPool(): void {
        xhgame.factory.actions.removeTextUiItem(this)
    }
}
export class CocosTextUiItemFactoryDrive extends Component implements IItemProduceDrive {
    private _prefab: Prefab
    private _modelPrefabsMap: Map<string, Prefab> = new Map();
    // protected onLoad(): void {
    //     this.preloadItemsResource()
    // }
    releaseItemsResource(itemNos?: string[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }
    async preloadItemsResource(): Promise<boolean> {
        console.log('CocosTextUiItemFactoryDrive preloadItemsResource 22')
        return new Promise((resolve, reject) => {
            xhgame.asset.loadBundle('bundle_game', (err, bundle) => {
                bundle.load<Prefab>('prefabs/cocosItems/cocosTextUiItem', (errp, prefab: Prefab) => {
                    if (errp) {
                        console.error(errp)
                    }
                    this._prefab = prefab
                    // console.log('this._prefab', this._prefab)
                    bundle.loadDir<Prefab>('prefabs/modelViews/textUiItems', (errp, prefabs: Prefab[]) => {
                        if (errp) {
                            console.error(errp)
                            reject(false)
                            return
                        }
                        prefabs.forEach((_prefab: Prefab) => {
                            this._modelPrefabsMap.set(_prefab.name, _prefab)
                        })
                        // console.log('this._modelPrefabsMap', this._modelPrefabsMap)
                        resolve(true)
                    })
                })
            })
        })
    }

    createItem(itemNo: string, itemId: number) {
        let node = instantiate(this._prefab);
        let prefab_path = this._modelPrefabsMap.get(itemNo)
        if (!prefab_path) {
            console.error('未找到prefab_path,itemNo=' + itemNo)
            // 如果找不到对应的prefab，则使用map中的第一个prefab
            prefab_path = Array.from(this._modelPrefabsMap.values())[0]
        }
        let modelNode = instantiate(prefab_path)
        node.getChildByName('modelBody').addChild(modelNode)
        // console.log('【====真实创建====】.prefab node', node)
        return node.getComponent(CocosTextUiItem)
    }
    removeItem(item: CocosTextUiItem) {
        // console.log('removeItem(item: CocosTextUiItem)')
        item.node.removeFromParent()
    }
}