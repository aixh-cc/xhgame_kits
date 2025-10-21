import { AssetManager, Node, sys } from "cc";
import { CryptoEmpty, CryptoManager, DI, IManagers, INode, StorageManager, Websocket } from "@aixh-cc/xhgame_ec_framework";
import { MyUiManager } from "./managers/MyUiManager";
import { MyAudioManager } from "./managers/MyAudioManager";
import { MyNetManager } from "./managers/MyNetManager";
import { MyFactoryManager } from "./managers/MyFactoryManager";
import { MyTableManager } from "./managers/MyTableManager";
import { MyEventManager } from "./managers/MyEventManager";
import { CocosUiDrive } from "./drives/CocosUiDrive";
import { MyAssetManager } from "./managers/MyAssetManager";
import { CocosAssetDrive } from "./drives/CocosAssetDrive";

export class CocosGameManagers implements IManagers {
    node: Node

    init(node: Node | INode) {
        this.node = node as Node
        this.build();
    }

    build() {
        console.log('CocosGameManagers build')
        this.setEventManager(new MyEventManager())
        this.setTableManager(this.getTables())
        this.setFactoryManager(this.getFactorys())
        this.setNetManager(new MyNetManager())
        this.setGuiManager(new MyUiManager<CocosUiDrive, Node>())
        this.setStorageManager(new StorageManager('xhgame', sys.localStorage))
        this.setCryptoManager(new CryptoManager('s', new CryptoEmpty()))
        this.setAudioManager(new MyAudioManager())
        //
        this.setAssetManager(new MyAssetManager<CocosAssetDrive>())
    }
    getTables() {
        let tableManager = new MyTableManager()
        tableManager.autoRegister()
        return tableManager
    }
    getFactorys() {
        let factoryManager = new MyFactoryManager()
        factoryManager.autoRegister()
        return factoryManager
    }
    guiManager: MyUiManager<CocosUiDrive, Node>
    setGuiManager(guiManager: MyUiManager<CocosUiDrive, Node>) {
        this.guiManager = guiManager
    }
    getGuiManager(): MyUiManager<CocosUiDrive, Node> {
        return this.guiManager
    }
    cryptoManager: CryptoManager<CryptoEmpty>
    setCryptoManager(cryptoManager) {
        this.cryptoManager = cryptoManager
    }
    getCryptoManager(): CryptoManager<CryptoEmpty> {
        return this.cryptoManager
    }
    audioManager: MyAudioManager
    setAudioManager(audioManager: MyAudioManager) {
        this.audioManager = audioManager
    }
    getAudioManager(): MyAudioManager {
        return this.audioManager
    }
    // table
    tableManager: MyTableManager
    setTableManager(tableManager: MyTableManager) {
        this.tableManager = tableManager
    }
    getTableManager(): MyTableManager {
        return this.tableManager
    }
    // factory
    factoryManager: MyFactoryManager
    setFactoryManager(factoryManager: MyFactoryManager) {
        this.factoryManager = factoryManager
    }
    getFactoryManager(): MyFactoryManager {
        return this.factoryManager
    }
    netManager: MyNetManager
    setNetManager(netManager: MyNetManager) {
        this.netManager = netManager
        return this
    }
    getNetManager(): MyNetManager {
        return this.netManager
    }
    storageManager: StorageManager
    setStorageManager(storageManager: StorageManager) {
        this.storageManager = storageManager
    }
    getStorageManager(): StorageManager {
        return this.storageManager
    }
    private _eventManager: MyEventManager
    setEventManager(eventManager: MyEventManager) {
        this._eventManager = eventManager
    }
    getEventManager(): MyEventManager {
        return this._eventManager
    }

    //
    private _assetManager: MyAssetManager<CocosAssetDrive>
    setAssetManager(assetManager: MyAssetManager<CocosAssetDrive>) {
        this._assetManager = assetManager
    }
    getAssetManager(): MyAssetManager<CocosAssetDrive> {
        return this._assetManager
    }
}

