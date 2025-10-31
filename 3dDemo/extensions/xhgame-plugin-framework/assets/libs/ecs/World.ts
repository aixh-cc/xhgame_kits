import { Component } from "./Component";
import { CompEnum } from "./components/SomeComponents";
import { EntityManager } from "./EntityManager";
import { System, SystemManager } from "./SystemManager";

export class World {
    entityManager: EntityManager
    systemManager: SystemManager
    constructor(entityManager, systemManager) {
        this.entityManager = entityManager
        this.systemManager = systemManager
    }

    registComponents(any) {
        this.entityManager.registComponents(any)
    }
    createEntity(): number {
        return this.entityManager.createEntity()
    }
    getEntityFlag(entityId: number) {
        return this.entityManager.getEntityFlag(entityId)
    }
    getEntitySize(): number {
        return this.entityManager.getEntitySize()
    }
    getComponentContainerSize(): number {
        return this.entityManager.getComponentContainerSize()
    }
    addComponent<T extends Component>(componentFlag: number, entityId: number): T {
        return this.entityManager.addComponent<T>(componentFlag, entityId)
    }
    removeComponent(componentFlag: number, entityId: number) {
        this.entityManager.removeComponent(componentFlag, entityId)
    }
    addSystem(system: System) {
        this.systemManager.addSystem(system)
    }

}