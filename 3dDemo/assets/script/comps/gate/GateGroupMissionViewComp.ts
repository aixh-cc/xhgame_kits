
import { DI, System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"
import { IUiItem } from "../../managers/myFactory/MyFactorys"
import { PlayerModelComp } from "../models/PlayerModelComp"
import { IMissionItem, IMissionItemVM, PlayerMissionModelComp } from "../models/PlayerMissionModelComp"
import { GateSenceComp } from "./GateSenceComp"
import { GateViewComp } from "./GateViewComp"

// 临时的
const itemsPositions: number[][] = [
    [-175, -240],
    [-80, -140],
    [60, -90],
    [150, 10],
    [15, 75],
    [-125, 115],
    [-220, 170],
    [-165, 255],
    [-35, 280],
    [145, 330],
]

export class GateGroupMissionViewSystem extends System {

    static async initComp(comp: GateGroupMissionViewComp) {
        await xhgame.gui.openUIAsync(xhgame.gui.enums.GateGroupMission, comp)
        const playerModel = DI.make<PlayerModelComp>('PlayerModelComp')
        const playerMissionModel = DI.make<PlayerMissionModelComp>('PlayerMissionModelComp')
        const maxBattleId = playerModel.playerInfo.maxBattleId
        // // 显示关卡信息到view上
        let group = 0
        const curGroupMissionInfo = await playerMissionModel.actions.getGroupMissionInfo(group)
        let missionItems: IMissionItem[] = curGroupMissionInfo.missionItems
        missionItems.forEach((_iMissionItem: IMissionItem, _index: number) => {
            let missionUiItem = xhgame.factory.actions.createUiItem('mission_item')
            missionUiItem.positions = itemsPositions[_index]
            missionUiItem.itemsIndex = _index
            let vm = missionUiItem.getViewVm<IMissionItemVM>()
            vm.starNum = _iMissionItem.maxStar
            vm.isFight = false
            vm.battleId = _iMissionItem.battleId
            if (_iMissionItem.maxScore == 0) {
                vm.isActive = false
            }
            if (_iMissionItem.battleId <= maxBattleId) {
                vm.isActive = true
            }
            missionUiItem.onClickCallback = () => {
                comp.actions.clickMissionItem(missionUiItem.itemsIndex)
            }
            missionUiItem.toScene()
            comp.uiItems.push(missionUiItem)
            if (playerModel.selectedBattleId == _iMissionItem.battleId) {
                comp.selectedIndex = _iMissionItem.index
                vm.isFight = true
            }
        })
    }

    static clickMissionItem(comp: GateGroupMissionViewComp, uiItemIndex: number) {
        let uiItem = comp.uiItems[uiItemIndex]
        const playerModel = DI.make<PlayerModelComp>('PlayerModelComp')
        const maxBattleId = playerModel.playerInfo.maxBattleId
        let vm = uiItem.getViewVm<IMissionItemVM>()
        if (vm.battleId > maxBattleId) {
            console.log('vm.battleId > maxBattleId')
            return // 不能点击
        }
        vm.isFight = true
        let pre_uiItem = comp.uiItems[comp.selectedIndex]
        let pre_vm = pre_uiItem.getViewVm<IMissionItemVM>()
        pre_vm.isFight = false
        // 
        comp.selectedIndex = uiItemIndex
        // console.log('clickMissionItem 11111', vm)
        // comp.selectedIndex = uiItem.itemsIndex
        // xhgame.gameEntity.playerModel.selectedBattleId = vm.battleId
        // xhgame.gameEntity.playerModel.notify()
    }

    static chooseSelectedToPlay(comp: GateGroupMissionViewComp) {
        let selectUiItem = comp.uiItems[comp.selectedIndex]
        const playerModel = DI.make<PlayerModelComp>('PlayerModelComp')
        const gateViewComp = xhgame.gameEntity.getComponent(GateViewComp)
        let battleId = selectUiItem.getViewVm<IMissionItemVM>().battleId
        playerModel.selectedBattleId = battleId
        playerModel.notify()
        gateViewComp.actions.startBattle()
        comp.detach()// 当前页面可以关闭了
    }

}

export class GateGroupMissionViewComp extends BaseModelComp {
    compName: string = 'GateGroupMissionViewComp'
    initBySystems: (typeof System)[] = [GateGroupMissionViewSystem]

    selectedIndex: number = -1
    // get selectedIndex() {
    //     return this._selectedIndex
    // }
    // set selectedIndex(val) {
    //     if (this._selectedIndex > -1) {
    //         let oldItem = this.uiItems[this.selectedIndex]
    //         let vm = oldItem.getViewVm<IMissionItemVM>()
    //         vm.isFight = false
    //         // vm.isSelected = false
    //     }
    //     this._selectedIndex = val
    //     if (val > -1) {
    //         let newItem = this.uiItems[this._selectedIndex]
    //         let vm = newItem.getViewVm<IMissionItemVM>()
    //         vm.isFight = true
    //         // vm.isSelected = true
    //     }
    // }
    uiItems: IUiItem[] = []
    reset() {
        // this._selectedIndex = -1
        for (let i = 0; i < this.uiItems.length; i++) {
            const element = this.uiItems[i];
            element.toPool()
        }
        this.uiItems = []
    }
    actions = {
        clickMissionItem: (_uiItemIndex: number) => {
            GateGroupMissionViewSystem.clickMissionItem(this, _uiItemIndex)
        },
        chooseSelectedToPlay: () => {
            GateGroupMissionViewSystem.chooseSelectedToPlay(this)
        }
    }

    onDetach() {
        xhgame.gui.removeUI(xhgame.gui.enums.GateGroupMission)
    }
}