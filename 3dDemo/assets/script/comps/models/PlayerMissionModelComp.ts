import { BaseModelComp, DI, System } from "@aixh-cc/xhgame_ec_framework";
import { xhgame } from "db://assets/script/xhgame";
import { PlayerModelComp } from "./PlayerModelComp";

export interface IMissionItem {
    battleId: number,
    index: number,
    maxScore: number,
    maxStar: number,
}

export interface IMissionItemVM {
    starNum: number
    isFight: boolean // 相当于isSelected
    isActive: boolean
    battleId: number
    // isSelected: boolean
}

export interface IGroupMissionInfo {
    playerId: number,
    groupId: number,
    missionItems: IMissionItem[]
}

export class PlayerMissionModelSystem extends System {
    static async getGroupMissionInfo(comp: PlayerMissionModelComp, group: number) {
        return new Promise<IGroupMissionInfo>(async (resolve, reject) => {
            if (comp.lastRewardId == comp.preLastRewardId) {
                console.log('getGroupMissionInfo:最近没有胜利，则取本地的数据')
                resolve(comp.curGroupMissionInfo)
                return
            }
            console.log('getGroupMissionInfo:从接口获取')
            let data = {
                token: xhgame.storage.origin_get('token'),
                groupId: group,
            }
            const playerModel = DI.make<PlayerModelComp>('PlayerModelComp')
            let ret = await xhgame.net.http.post(playerModel.accountInfo.hallDomain + '/' + xhgame.net.enums.GetPlayerMission, data)
            if (ret.isSucc) {
                let data = ret.res
                comp.curGroupMissionInfo = data.missionInfo
                comp.preLastRewardId = comp.lastRewardId
                resolve(comp.curGroupMissionInfo)
            } else {
                reject()
            }
        })
    }

}

export class PlayerMissionModelComp extends BaseModelComp {
    compName: string = 'PlayerMissionModelComp'
    initBySystems: (typeof System)[] = []
    // 
    curGroupMissionInfo: IGroupMissionInfo = null
    selectedBattleId: number = 0
    lastRewardId: number = 0
    preLastRewardId: number = -1
    reset() {
        this.curGroupMissionInfo = null
        this.selectedBattleId = 0
        this.lastRewardId = 0
        this.preLastRewardId = -1
    }
    actions = {
        getGroupMissionInfo: (group) => {
            return PlayerMissionModelSystem.getGroupMissionInfo(this, group)
        }
    }
    onDetach(): void {

    }
}