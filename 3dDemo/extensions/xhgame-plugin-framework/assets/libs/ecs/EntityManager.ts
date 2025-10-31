import { Component } from "./Component";
import { COMPONENT_NONE } from "./components/SomeComponents";
import { Pool } from "./Pool";


export class EntityManager {
    private static instance: EntityManager = new EntityManager();
    /**
     * 组件的表格容器[][]
     * 第一个[]是注册组件的index
     * 第二个[]是组件所在是实体index
     */
    private _table_ComponentContainer: Component[][] = [];
    /**
     * 实体对应的falg值
     * index为实体index
     * number值为该实体的falg,默认实体无组件时number为0
     */
    private _entityIndex_EntityFlagArray: number[] = [];
    /**
     * 当前实体index对应的实体id
     * index为实体index
     * number值为实体id
     * 说明:实体不断地在生成和消除，所以实体id是变化的。但是场上的存活的实体如果以点名方式点名的话，其实体index总是从12345开始，是一个连续的数
     */
    private _entityIndex_EntityIdArray: number[] = []
    /** 实体id */
    private _nextEntityId: number = 0


    private constructor() { }

    /** _debug模式下可以看到更多的打印数据 */
    private _is_debug: boolean = false
    /** 设置_debug */
    setDebug(val: boolean) {
        this._is_debug = val
    }

    static getInstance(): EntityManager {
        return EntityManager.instance;
    }

    // 单元测试时需要每个都new
    static getInstanceForTest(): EntityManager {
        return new EntityManager();
    }
    getEntityIds() {
        return this._entityIndex_EntityIdArray
    }

    /** 
     * 创建实体 
     */
    createEntity(): number {
        let entityIndex = this._entityIndex_EntityFlagArray.length;
        this._entityIndex_EntityFlagArray.push(0); // 默认标识为0

        let size = this._table_ComponentContainer.length;
        for (let i = 0; i < size; i++) {
            this._table_ComponentContainer[i].push(null);
        }
        let entityId = this._nextEntityId++
        this._entityIndex_EntityIdArray[entityIndex] = entityId
        return entityId
    }

    /**
     * 移除实体
     * @param entityId 
     */
    removeEntity(entityId: number): void {
        let entityIndex = this._entityIndex_EntityIdArray.indexOf(entityId) //  this._aliveEntityMap.get(entityId)
        if (entityIndex < 0) throw new Error("Entity must be bigger or equal than 0");
        const size = this._entityIndex_EntityFlagArray.length;
        if (entityIndex >= size) throw new Error("Entity must be smaller than the size, so that we can remove the entityIndex");
        let lastEntityIndex = this._entityIndex_EntityFlagArray.length - 1; // 最后一个实体index
        // 置换1
        let tmp_EntityId = this._entityIndex_EntityIdArray[entityIndex]
        this._entityIndex_EntityIdArray[entityIndex] = this._entityIndex_EntityIdArray[lastEntityIndex]
        this._entityIndex_EntityIdArray[lastEntityIndex] = tmp_EntityId
        // 置换2
        let tmp_EntityFlag = this._entityIndex_EntityFlagArray[entityIndex]
        this._entityIndex_EntityFlagArray[entityIndex] = this._entityIndex_EntityFlagArray[lastEntityIndex]
        this._entityIndex_EntityFlagArray[lastEntityIndex] = tmp_EntityFlag
        // 删除
        this._entityIndex_EntityIdArray.splice(lastEntityIndex, 1);
        this._entityIndex_EntityFlagArray.splice(lastEntityIndex, 1);

        for (let i = 0; i < this._table_ComponentContainer.length; i++) {
            let tmp_component = this._table_ComponentContainer[i][entityIndex]
            // 将每个类型组件里面的 组件数组 按照实体index进行重新排序，这里将要删除的实体的位置与最后一个进行互换
            this._table_ComponentContainer[i][entityIndex] = this._table_ComponentContainer[i][lastEntityIndex];
            this._table_ComponentContainer[i][lastEntityIndex] = tmp_component
            this._table_ComponentContainer[i].splice(lastEntityIndex, 1);
        }
    }

    /**
     * 注册组件数量
     * @param componentSize 
     */
    registComponents(compEnum: any): void {
        let componentSize = Object.keys(compEnum).length / 2
        for (let i = 0; i < componentSize; i++) {
            this._table_ComponentContainer.push([]);
        }
    }

    addComponent<T>(componentFlag: number, entityId: number): T {
        let entityIndex = this._entityIndex_EntityIdArray.indexOf(entityId)
        if (entityIndex < 0) throw new Error("Entity must be bigger or equal than 0");
        const size = this._entityIndex_EntityFlagArray.length;
        if (entityIndex >= size) throw new Error("Entity must be smaller than the size, so that we can remove the entityIndex");

        let mask = this._entityIndex_EntityFlagArray[entityIndex];

        if ((mask & componentFlag) === componentFlag) {
            return; // console.log('已经存在这个组件')
        };
        this._entityIndex_EntityFlagArray[entityIndex] |= componentFlag;

        const index = this.getBitOne64(componentFlag) - 1;
        this._table_ComponentContainer[index][entityIndex] = Pool.getInstance().getComponentByFlag(componentFlag);

        return this._table_ComponentContainer[index][entityIndex] as T
    }


    removeComponent(componentFlag: number, entityId: number): void {
        let entityIndex = this._entityIndex_EntityIdArray.indexOf(entityId)
        if (entityIndex < 0) throw new Error("Entity must be bigger or equal than 0");
        const size = this._entityIndex_EntityFlagArray.length;
        if (entityIndex >= size) throw new Error("Entity must be smaller than the size, so that we can remove the entityIndex");

        let mask = this._entityIndex_EntityFlagArray[entityIndex];
        if ((mask & componentFlag) === COMPONENT_NONE) {
            return; // console.log('没有这个组件')
        }
        this._entityIndex_EntityFlagArray[entityIndex] &= ~componentFlag;
        const index = this.getBitOne64(componentFlag) - 1;
        this._table_ComponentContainer[index][entityIndex] = null;
    }

    getComponentList(componentFlag: number): Component[] {
        const index = this.getBitOne64(componentFlag) - 1;
        return this._table_ComponentContainer[index];
    }

    getComponent<T extends Component>(componentFlag: number, entityId: number): T | null {
        let entityIndex = this._entityIndex_EntityIdArray.indexOf(entityId)
        if (entityIndex < 0) throw new Error("Entity must be bigger or equal than 0");
        const size = this._entityIndex_EntityFlagArray.length;
        if (entityIndex >= size) throw new Error("Entity must be smaller than the size, so that we can remove the entityIndex");

        const flag = this._entityIndex_EntityFlagArray[entityIndex];

        if ((flag & componentFlag) === componentFlag) {
            const index = this.getBitOne64(componentFlag) - 1;
            return this._table_ComponentContainer[index][entityIndex] as T;
        }
        return null;
    }

    /** 获取实体flag值 */
    getEntityFlag(entityId: number): number {
        let entityIndex = this._entityIndex_EntityIdArray.indexOf(entityId)
        if (entityIndex == -1) {
            return -1
        }
        const size = this._entityIndex_EntityFlagArray.length;
        if (entityIndex >= size) throw new Error("Entity must be smaller than the size, so that we can remove the entityIndex");
        return this._entityIndex_EntityFlagArray[entityIndex];
    }

    // setEntityFlag(entityId: number, entityType: number): void {
    //     let entityIndex = this._entityIndex_EntityIdArray.indexOf(entityId)
    //     if (entityIndex < 0) throw new Error("Entity must be bigger or equal than 0");
    //     const size = this._entityIndex_EntityFlagArray.length;
    //     if (entityIndex >= size) throw new Error("Entity must be smaller than the size, so that we can remove the entityIndex");
    //     this._entityIndex_EntityFlagArray[entityIndex] = entityType;
    // }

    /** 获取实体数量 */
    getEntitySize(): number {
        return this._entityIndex_EntityFlagArray.length;
    }
    /** 获取组件容器大小 */
    getComponentContainerSize(): number {
        return this._table_ComponentContainer.length;
    }

    _destroy(): void {
        for (let i = 0; i < this._table_ComponentContainer.length; i++) {
            for (let j = 0; j < this._table_ComponentContainer[i].length; j++) {
                const component = this._table_ComponentContainer[i][j];
                if (component !== null) {
                    // Perform any cleanup if necessary
                }
                this._table_ComponentContainer[i][j] = null;
            }
            this._table_ComponentContainer[i] = [];
        }
        this._table_ComponentContainer = [];
    }

    private getBitOne64(value: number): number {
        if (value === 0) return -1;
        let position = 0;
        while ((value & 1) === 0) {
            value >>= 1;
            position++;
        }
        return position + 1;
    }

    public debug(str = '') {
        return this._debug(str)
    }

    private _debug(str = '') {
        if (!this._is_debug) {
            return
        }
        console.log('======' + str + '===start===')
        console.log('_table_ComponentContainer', this._table_ComponentContainer)
        console.log('_entityIndex_EntityFlagArray', this._entityIndex_EntityFlagArray)
        console.log('======' + str + '===end===')

    }
}
