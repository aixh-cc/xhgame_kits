import { TestAudioDrive } from "./drive/TestAudioDrive";
import { TestUiDrive } from "./drive/TestUiDrive";
import { CryptoEmpty, CryptoManager, DI, EventManager, FetchHttp, IManagers, INode, NetManager, StorageManager, Websocket } from "@aixh-cc/xhgame_ec_framework";
import { MyTestFactoryConfig } from "../MyTestFactoryConfig";
import { MyFactoryActions } from "db://assets/script/managers/myFactory/MyFactoryActions";
import { MyAudioManager } from "db://assets/script/managers/MyAudioManager";
import { MyUiManager } from "db://assets/script/managers/MyUiManager";
import { MyNetManager } from "db://assets/script/managers/MyNetManager";
import { MyTableManager } from "db://assets/script/managers/MyTableManager";
import { MyFactoryManager } from "db://assets/script/managers/MyFactoryManager";
import { ApiEnums } from "db://assets/script/managers/ApiEnums";
import { AssetManager } from "cc";

export class MyTestNetManager extends NetManager<FetchHttp, Websocket> {
    constructor() {
        super(new FetchHttp(), new Websocket())
    }

    get enums() {
        return ApiEnums
    }
}

export class TestNode implements INode {
    name: string = ''
    constructor(name: string) {
        this.name = name
    }
}
interface IBundle {
    loadDir(dir: string, onProgress: ((finished: number, total: number, item: any) => void) | null, onComplete: (err: Error | null, data: any[]) => void): void
}
class TestBundle implements IBundle {
    loadDir(dir: string, onProgress: ((finished: number, total: number, item: any) => void) | null, onComplete: (err: Error | null, data: any[]) => void): void {
        let finished = 100
        let total = 100
        let item = {}
        onProgress(finished, total, item)
        let items = []
        onComplete(null, items)
    }
}
interface IAssetManager {
    loadBundle(nameOrUrl: string, onComplete?: (err: Error, data: IBundle) => void): void
}
class TestAssetManager implements IAssetManager {
    loadBundle(nameOrUrl: string, onComplete: (err: Error, data: IBundle) => void) {
        let err = null
        let data = new TestBundle()
        onComplete(err, data)
    }
}

export class TestGameManagers implements IManagers {
    init(node: TestNode) {
        this.setEventManager(new EventManager())
        this.setTableManager(getTables())
        this.setFactoryManager(this.getFactorys())
        this.setNetManager(new MyTestNetManager())
        this.setGuiManager(new MyUiManager<TestUiDrive, TestNode>())
        this.setStorageManager(new StorageManager('xhgame', getLocalStorage()))
        // // this.setCameraManager(new CameraManager(new UICamera(), new UICamera()))
        // this.setCryptoManager(new CryptoManager('s', new CryptoEmpty()))
        this.setAudioManager(new MyAudioManager())
        this.setAssetManager(new TestAssetManager())
        console.log('构建完成')
        // let mm = DI.make('mm')
        // console.log('mm', mm, mm.getDdd())
    }
    guiManager: MyUiManager<TestUiDrive, TestNode>
    setGuiManager(guiManager) {
        this.guiManager = guiManager
    }
    getGuiManager(): MyUiManager<TestUiDrive, TestNode> {
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
    // cameraManager: CameraManager<UICamera, UICamera>
    // setCameraManager(cameraManager) {
    //     this.cameraManager = cameraManager
    //     return this
    // }
    // getCameraManager(): CameraManager<UICamera, UICamera> {
    //     return this.cameraManager
    // }
    netManager: MyTestNetManager
    setNetManager(netManager: MyTestNetManager) {
        this.netManager = netManager
        return this
    }
    getNetManager(): MyTestNetManager {
        return this.netManager
    }
    storageManager: StorageManager
    setStorageManager(storageManager: StorageManager) {
        this.storageManager = storageManager
    }
    getStorageManager(): StorageManager {
        return this.storageManager
    }
    private _eventManager: EventManager
    setEventManager(eventManager: EventManager) {
        this._eventManager = eventManager
    }
    getEventManager(): EventManager {
        return this._eventManager
    }
    private _assetManager: IAssetManager
    setAssetManager(assetManager: IAssetManager) {
        this._assetManager = assetManager
    }
    getAssetManager(): IAssetManager {
        return this._assetManager
    }
    getFactorys() {
        let factoryManager = new MyFactoryManager()
        factoryManager.autoRegister()
        return factoryManager
    }

}

const getTables = () => {
    let tableManager = new MyTableManager()
    tableManager.autoRegister()
    return tableManager
}

const getLocalStorage = () => {
    const LocalStorage = require('node-localstorage').LocalStorage;
    let localStorage = new LocalStorage('./scratch', { quota: 10 * 1024 * 1024 }); // 设置为 10MB
    return localStorage
}