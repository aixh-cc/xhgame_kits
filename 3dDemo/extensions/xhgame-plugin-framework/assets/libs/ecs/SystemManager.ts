
export abstract class System {
    /** 优先级 */
    public priority: number;

    constructor(priority: number) {
        this.priority = priority;
    }

    abstract enter(): void;
    abstract execute(dt: number): void;
    abstract exit(): void;
}

export class SystemManager {
    private static instance: SystemManager = new SystemManager();
    private systemList: System[] = [];
    private bPaused: boolean = false;

    private constructor() { }

    public static getInstance(): SystemManager {
        return SystemManager.instance;
    }

    // 单元测试时需要每个都new
    static getInstanceForTest(): SystemManager {
        return new SystemManager();
    }

    /** _debug模式下可以看到更多的打印数据 */
    private _is_debug: boolean = false
    /** 设置_debug */
    setDebug(val: boolean) {
        this._is_debug = val
    }

    public addSystem(system: System): void {
        system.enter();

        const size = this.systemList.length;

        if (size === 0) {
            this.systemList.push(system);
            return;
        }
        if (system.priority >= this.systemList[0].priority) {
            this.systemList.unshift(system);
            return;
        } else if (system.priority <= this.systemList[size - 1].priority) {
            this.systemList.push(system);
            return;
        }

        let start = 0;
        let end = size - 1;
        while (true) {
            const mid = Math.floor((start + end) / 2);
            if (
                this.systemList[mid].priority >= system.priority &&
                this.systemList[mid + 1].priority <= system.priority
            ) {
                this.systemList.splice(mid + 1, 0, system);
                break;
            } else if (this.systemList[mid].priority < system.priority) {
                end = mid;
            } else if (this.systemList[mid + 1].priority > system.priority) {
                start = mid + 1;
            }
        }
    }

    public update(dt: number): void {
        if (this.bPaused) return;

        for (const system of this.systemList) {
            system.execute(dt);
        }
    }

    public pause(): void {
        this.bPaused = true;
    }

    public resume(): void {
        this.bPaused = false;
    }

    getSystemList() {
        return this.systemList
    }

    private destroy(): void {
        for (const system of this.systemList) {
            system.exit();
            // Assuming systems are managed elsewhere and do not need deletion
        }
        this.systemList = [];
    }

    public debug(str = '') {
        return this._debug(str)
    }

    private _debug(str = '') {
        if (!this._is_debug) {
            return
        }
        console.log('======' + str + '======')
        console.log('systemList', this.systemList)
    }

}
