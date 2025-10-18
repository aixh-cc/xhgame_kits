
import { DI, IGame, IManagers, TimeSystem } from "@aixh-cc/xhgame_ec_framework";
// import { CocosGameManagers } from "./CocosGameManagers";
// import { CocosGame } from "./CocosGame";
import { TestGameManagers } from "../../tests/myTestGame/test/TestGameManagers";
import { TestGame } from "../../tests/myTestGame/TestGame";
import { CocosGameManagers } from "./CocosGameManagers";
import { CocosGame } from "./CocosGame";
import { CocosDrives } from "./CocosDrives";
export class xhgame {
    /**
    * test 时,打开下面的注释 
    * ==== test start ====
    */
    // static getManagers() {
    //     return DI.make<IManagers>('IManagers') as TestGameManagers;
    // }
    // static getGame() {
    //     return DI.make<TestGame>('IGame') as TestGame;
    // }
    // ==== test end ====

    // cocos 时,打开下面的注释  ==== cocos start ====
    static getManagers() {
        return DI.make<CocosGameManagers>('IManagers') as CocosGameManagers;
    }
    static getGame<T extends IGame>() {
        return DI.make<CocosGame>('IGame') as CocosGame;
    }
    static getDrives() {
        return DI.make<CocosDrives>('IDrives') as CocosDrives;
    }
    // ==== cocos end ====
    static get game() {
        return this.getGame();
    }
    static get gameEntity() {
        return this.getGame().getGameEntity()
    }
    /**  网络通讯管理 */
    static get net() {
        return this.getManagers().getNetManager()
    };
    /**  加密管理 */
    static get crypto() {
        return this.getManagers().getCryptoManager()
    }
    /** gui管理 */
    static get gui() {
        return this.getManagers().getGuiManager()
    }
    /** 游戏音乐音效管理 */
    static get audio() {
        return this.getManagers().getAudioManager()
    }
    /** 事件管理 */
    static get event() {
        return this.getManagers().getEventManager()
    }
    /** 工厂管理 */
    static get factory() {
        return this.getManagers().getFactoryManager()
    }
    /** 配置管理 */
    static get table() {
        return this.getManagers().getTableManager()
    }
    /** 本地存储 */
    static get storage() {
        return this.getManagers().getStorageManager()
    }
    /** 游戏时间管理 */
    static get timer() {
        return TimeSystem.getInstance()
    }
}
