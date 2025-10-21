import { DI, Entity, IGame, Platform } from "@aixh-cc/xhgame_ec_framework";
import { TestGameManagers, TestNode } from "./test/TestGameManagers";
import { GameEntity } from "db://assets/script/GameEntity";
import { IConfigTableItem } from "db://assets/script/managers/myTable/tables/ConfigTable";
import { xhgame } from "db://assets/script/xhgame";
import { GameEnterComp } from "db://assets/script/comps/enter/GameEnterComp";
import { TestDrives } from "./TestDrives";
import { LoadResourceToGateComp } from "db://assets/script/comps/enter/LoadResourceToGateComp";

export class TestGame implements IGame {
    name = 'TestGame';
    node: TestNode = new TestNode('root')
    private _gameEntity: GameEntity = null
    setGameEntity(gameEntity: GameEntity) {
        this._gameEntity = gameEntity
    }
    getGameEntity(): GameEntity {
        return this._gameEntity
    }
    serverNo: string = '0'
    config: IConfigTableItem = null
    at_platform: Platform = Platform.H5
    screen: { w: number, h: number } = { w: 640, h: 960 }
    testing: boolean = false

    async start() {
        this.serverNo = 'dev_001'
        this.at_platform = Platform.H5
        const drives = new TestDrives()
        const managers = new TestGameManagers()
        DI.bindInstance('IDrives', drives)
        DI.bindInstance('IGame', this)
        DI.bindInstance('IManagers', managers)

        managers.init(this.node)
        await this.init()
        console.log('init over')
        await this.play()
        console.log('play over')
        console.log('等待玩家操作')
    }

    async init() {
        this.setGameEntity(Entity.createEntity<GameEntity>(GameEntity))
        await xhgame.gameEntity.attachComponent(LoadResourceToGateComp).done()
        this.config = xhgame.table.getTable(xhgame.table.enums.config).getInfo(this.serverNo)
    }

    async play(): Promise<void> {
        xhgame.timer.timePlay()
        await xhgame.gameEntity.attachComponent(GameEnterComp).done()
    }
}