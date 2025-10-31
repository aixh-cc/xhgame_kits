
import { CompEnum, PositionComponent, RenderComponent } from "./components/SomeComponents";


export class Pool {
    private static instance: Pool = new Pool();

    private constructor() { }

    /** _debug模式下可以看到更多的打印数据 */
    private _is_debug: boolean = false
    /** 设置_debug */
    setDebug(val: boolean) {
        this._is_debug = val
    }

    static getInstance(): Pool {
        return Pool.instance;
    }

    // todo
    getComponentByFlag(componentFlag: number) {
        if (componentFlag == CompEnum.COMPONENT_RENDER) {
            return new RenderComponent()
        }
        if (componentFlag == CompEnum.COMPONENT_POSITION) {
            return new PositionComponent()
        }
        return new RenderComponent()
    }

}