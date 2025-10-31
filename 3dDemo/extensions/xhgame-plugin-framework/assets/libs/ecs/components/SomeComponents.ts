import { Component } from "../Component";


// Constants for component types
export const COMPONENT_NONE = 0x0;
export const COMPONENT_RENDER = 1 << 1;
export const COMPONENT_POSITION = 1 << 2;
export const COMPONENT_VELOCITY = 1 << 3;
export const COMPONENT_HEALTH = 1 << 4;
export const COMPONENT_COLLID = 1 << 5;
export const COMPONENT_ENTITY_TYPE = 1 << 6;
export const COMPONENT_ANIMATE = 1 << 7;

export enum CompEnum {
    COMPONENT_NONE = 0x0, // 空组件
    COMPONENT_RENDER = 1 << 1,
    COMPONENT_POSITION = 1 << 2,
    COMPONENT_VELOCITY = 1 << 3,
    COMPONENT_ENTITY_TYPE = 1 << 4
}

// Render Component
export class RenderComponent extends Component {

    sprite: any; // Replace 'any' with the appropriate type for your sprite

    constructor() {
        super();
        // this.sprite = sprite;
    }

    dispose(): void {
        this.sprite.removeFromParentAndCleanup(true);
        // Assuming sprite is managed elsewhere and does not need deletion
    }
}

// Position Component
export class PositionComponent extends Component {

    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        super();
        this.x = x;
        this.y = y;
    }
}

// Velocity Component
export class VelocityComponent extends Component {

    vx: number;
    vy: number;

    constructor(vx: number = 0, vy: number = 0) {
        super();
        this.vx = vx;
        this.vy = vy;
    }
}

// EntityType Component
export class EntityTypeComponent extends Component {

    static readonly RED_CUBE = 1 << 1;
    static readonly PURPLE_CUBE = 1 << 2;
    static readonly ORANGE_CUBE = 1 << 3;
    static readonly GREEN_CUBE = 1 << 4;
    static readonly SPHERE_BALL = 1 << 5;
    static readonly PLAYER = 1 << 6;

    type: number;

    constructor(type: number) {
        super();
        this.type = type;
    }
}
