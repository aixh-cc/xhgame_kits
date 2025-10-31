import { COMPONENT_ENTITY_TYPE, COMPONENT_POSITION, COMPONENT_RENDER, EntityTypeComponent, PositionComponent, RenderComponent } from "../components/SomeComponents";
import { EntityManager } from "../EntityManager";
import { System } from "../SystemManager";


export class RenderSystem extends System {

    constructor(_priority: number) {
        super(_priority);
    }

    enter(): void {
        // Implementation for enter
    }

    execute(dt: number): void {
        const entityManager = EntityManager.getInstance();
        const size = entityManager.getEntitySize();

        for (let i = 0; i < size; i++) {
            const flag = entityManager.getEntityFlag(i);
            if ((flag & (COMPONENT_RENDER | COMPONENT_POSITION)) === (COMPONENT_RENDER | COMPONENT_POSITION)) {
                const pRender = entityManager.getComponent(COMPONENT_RENDER, i) as RenderComponent;
                const pPos = entityManager.getComponent(COMPONENT_POSITION, i) as PositionComponent;

                // if (pRender.sprite.getParent() === null) {
                //     const pType = entityManager.getComponent(COMPONENT_ENTITY_TYPE, i) as EntityTypeComponent;
                //     if (pType.type !== EntityTypeComponent.PLAYER) {
                //         pRender.sprite.runAction(CCRepeatForever.create(CCRotateBy.create(1.0 / 60, 5)));
                //         this.scene.addChild(pRender.sprite);
                //     } else {
                //         this.scene.addChild(pRender.sprite, 10);
                //     }
                // }

                // pRender.sprite.setPosition(ccp(pPos.x, pPos.y));
            }
        }
    }

    exit(): void {
        const entityManager = EntityManager.getInstance();
        const size = entityManager.getEntitySize();

        for (let i = 0; i < size; i++) {
            const pRender = entityManager.getComponent(COMPONENT_RENDER, i) as RenderComponent;
            pRender.sprite.stopAllActions();
            pRender.sprite.removeFromParentAndCleanup(true);
        }
    }
}

export class MovementSystem extends System {

    constructor(_priority: number) {
        super(_priority);
    }

    enter(): void {
        // Implementation for enter
    }

    execute(dt: number): void {
        console.log('MovementSystem execute dt', dt)
    }

    exit(): void {
        // Implementation for exit
    }
}

class CreatorSystem extends System {
    private frames: number;

    constructor(_priority: number) {
        super(_priority);
        this.frames = 0;
    }

    enter(): void {
        // Implementation for enter
    }

    execute(dt: number): void {
        this.frames++;

        let delta = Math.floor(this.frames / 1800);
        if (delta >= 30) {
            delta = 30;
        }

        // if (this.frames % (60 - delta) === 0) {
        //     const value = Math.floor(Math.random() * 100);
        //     const vy = -60 - (this.frames / 300.0) * 10;

        //     if (0 <= value && value < 40) {
        //         EntityCreator.createGreenCube(0, vy);
        //     } else if (40 <= value && value < 80) {
        //         EntityCreator.createRedCube(0, vy);
        //     } else if (80 <= value && value < 90) {
        //         EntityCreator.createOrangeCube(0, 0.6 * vy);
        //     } else if (90 <= value && value < 100) {
        //         EntityCreator.createPurpleCube(0, 0.4 * vy);
        //     }
        // }
    }

    exit(): void {
        // Implementation for exit
    }
}