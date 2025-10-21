/**
 * Cocos Creator 编辑器通信桥接模块
 * 提供与 Cocos Creator 编辑器的双向通信功能
 */

export interface CocosEditorAPI {
    // 消息通信
    sendMessage(target: string, method: string, ...args: any[]): Promise<any>;
    requestMessage(target: string, method: string, ...args: any[]): Promise<any>;

    // 事件监听
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    emit(event: string, ...args: any[]): void;

    // 编辑器操作
    getVersion(): Promise<string>;
    getSceneInfo(): Promise<any>;
    openPanel(panelName: string): Promise<void>;
    closePanel(panelName: string): Promise<void>;

    // 资源操作
    selectAsset(uuid: string): Promise<void>;
    importAsset(path: string): Promise<void>;
    refreshAssets(): Promise<void>;

    // 场景操作
    selectNode(uuid: string): Promise<void>;
    createNode(name: string, parent?: string): Promise<string>;
    deleteNode(uuid: string): Promise<void>;
}

class CocosEditorBridge implements CocosEditorAPI {
    private eventListeners: Map<string, Function[]> = new Map();
    private isDevMode: boolean = false;

    constructor() {
        this.isDevMode = import.meta.env.DEV || !(window as any).Editor;
        this.initializeEventSystem();
    }

    private initializeEventSystem() {
        if (this.isDevMode) {
            console.log('🔧 [CocosEditorBridge] Running in development mode');
            this.setupDevModeHandlers();
        } else {
            console.log('🎮 [CocosEditorBridge] Connected to Cocos Creator Editor');
            this.setupEditorHandlers();
        }
    }

    private setupDevModeHandlers() {
        // 开发模式下的模拟处理器
        (window as any).__COCOS_BRIDGE_DEV__ = {
            triggerEvent: (event: string, ...args: any[]) => {
                this.emit(event, ...args);
            },
            simulateAssetChange: () => {
                this.emit('asset-db:asset-change', {
                    uuid: 'mock-uuid-' + Date.now(),
                    path: 'assets/mock-asset.png',
                    type: 'texture'
                });
            },
            simulateNodeSelection: (nodeName: string = 'MockNode') => {
                this.emit('scene:node-changed', {
                    uuid: 'mock-node-uuid-' + Date.now(),
                    name: nodeName,
                    path: `Scene/${nodeName}`
                });
            }
        };

        console.log('🛠️ Dev mode handlers available at window.__COCOS_BRIDGE_DEV__');
    }

    private setupEditorHandlers() {
        // 真实编辑器环境下的事件监听
        if ((window as any).Editor && (window as any).Editor.Message) {
            // 监听编辑器事件
            (window as any).Editor.Message.addBroadcastListener('asset-db:asset-change', (event: any) => {
                this.emit('asset-change', event);
            });

            (window as any).Editor.Message.addBroadcastListener('scene:node-changed', (event: any) => {
                this.emit('node-changed', event);
            });
        }
    }

    async sendMessage(target: string, method: string, ...args: any[]): Promise<any> {
        if (this.isDevMode) {
            console.log(`📤 [Mock] Send message: ${target}.${method}`, args);
            return this.mockResponse(method, args);
        }

        if ((window as any).Editor && (window as any).Editor.Message) {
            return (window as any).Editor.Message.send(target, method, ...args);
        }

        throw new Error('Editor API not available');
    }

    async requestMessage(target: string, method: string, ...args: any[]): Promise<any> {
        if (this.isDevMode) {
            console.log(`📥 [Mock] Request message: ${target}.${method}`, args);
            return this.mockResponse(method, args);
        }

        if ((window as any).Editor && (window as any).Editor.Message) {
            return (window as any).Editor.Message.request(target, method, ...args);
        }

        throw new Error('Editor API not available');
    }

    private mockResponse(method: string, args: any[]): any {
        switch (method) {
            case 'get-version':
                return 'Cocos Creator 3.8.6 (Development Mode)';
            case 'select-asset':
                return { success: true, uuid: args[0] };
            case 'create-node':
                return { success: true, uuid: 'mock-node-' + Date.now(), name: args[0] };
            case 'get-scene-info':
                return {
                    name: 'MockScene',
                    uuid: 'mock-scene-uuid',
                    nodes: [
                        { name: 'Canvas', uuid: 'mock-canvas-uuid' },
                        { name: 'Camera', uuid: 'mock-camera-uuid' }
                    ]
                };
            default:
                return { success: true, method, args };
        }
    }

    on(event: string, callback: Function): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(callback);
    }

    off(event: string, callback: Function): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(event: string, ...args: any[]): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    async getVersion(): Promise<string> {
        // if (this.isDevMode) {
        //     return this.mockResponse('get-version', []);
        // }

        // // 在真实的 Cocos Creator 环境中，直接使用 Editor.App.version
        // if ((window as any).Editor && (window as any).Editor.App) {
        //     console.log('真实的cocos编辑器环境', (window as any).Editor)
        //     return (window as any).Editor.App.version;
        // }

        throw new Error('Editor API not available');
    }

    async getSceneInfo(): Promise<any> {
        if (this.isDevMode) {
            return {
                name: 'MockScene',
                uuid: 'mock-scene-uuid-12345',
                path: 'assets/scenes/MockScene.scene',
                nodes: ['Node1', 'Node2', 'Camera', 'Canvas']
            };
        }

        // 在真实的 Cocos Creator 环境中，使用正确的 API
        if ((window as any).Editor && (window as any).Editor.Message) {
            try {
                // 方法1: 尝试获取当前场景的 UUID
                const sceneUuid = await (window as any).Editor.Message.request('scene', 'query-current-scene');
                if (sceneUuid) {
                    // 获取场景的详细信息
                    const sceneInfo = await (window as any).Editor.Message.request('asset-db', 'query-asset-info', sceneUuid);
                    return {
                        name: sceneInfo?.name || 'Current Scene',
                        uuid: sceneUuid,
                        path: sceneInfo?.path || 'unknown',
                        nodes: [] // 节点信息需要额外的 API 调用
                    };
                }
            } catch (error) {
                console.warn('Failed to get scene info via Editor.Message, trying alternative method:', error);
            }

            try {
                // 方法2: 尝试直接获取场景信息
                const sceneData = await (window as any).Editor.Message.request('scene', 'query-scene-info');
                if (sceneData) {
                    return sceneData;
                }
            } catch (error) {
                console.warn('Alternative scene info method also failed:', error);
            }
        }

        // 如果都失败了，返回默认信息
        return {
            name: 'Unknown Scene',
            uuid: 'unknown',
            path: 'unknown',
            nodes: [],
            error: 'Editor Scene API not available'
        };
    }

    async openPanel(panelName: string): Promise<void> {
        if (this.isDevMode) {
            console.log(`[Mock] Opening panel: ${panelName}`);
            return;
        }

        // 在真实的 Cocos Creator 环境中，使用 Editor.Panel.open
        if ((window as any).Editor && (window as any).Editor.Panel) {
            return (window as any).Editor.Panel.open(panelName);
        }

        throw new Error('Editor Panel API not available');
    }

    async closePanel(panelName: string): Promise<void> {
        if (this.isDevMode) {
            console.log(`[Mock] Closing panel: ${panelName}`);
            return;
        }

        // 在真实的 Cocos Creator 环境中，使用 Editor.Panel.close
        if ((window as any).Editor && (window as any).Editor.Panel) {
            return (window as any).Editor.Panel.close(panelName);
        }

        throw new Error('Editor Panel API not available');
    }

    async selectAsset(uuid: string): Promise<void> {
        if (this.isDevMode) {
            console.log(`[Mock] Selecting asset: ${uuid}`);
            return;
        }

        // 在真实环境中，这些操作可能需要通过消息系统或特定的 API
        // 由于没有直接的 API，我们使用消息系统，但需要确保目标服务存在
        try {
            if ((window as any).Editor && (window as any).Editor.Message) {
                return await (window as any).Editor.Message.send('asset-db', 'select-asset', uuid);
            }
        } catch (error) {
            console.warn('Asset selection not supported in current environment:', error);
        }
    }

    async importAsset(path: string): Promise<void> {
        if (this.isDevMode) {
            console.log(`[Mock] Importing asset: ${path}`);
            return;
        }

        try {
            if ((window as any).Editor && (window as any).Editor.Message) {
                return await (window as any).Editor.Message.send('asset-db', 'import-asset', path);
            }
        } catch (error) {
            console.warn('Asset import not supported in current environment:', error);
        }
    }

    async refreshAssets(): Promise<void> {
        if (this.isDevMode) {
            console.log(`[Mock] Refreshing assets`);
            return;
        }

        try {
            if ((window as any).Editor && (window as any).Editor.Message) {
                return await (window as any).Editor.Message.send('asset-db', 'refresh');
            }
        } catch (error) {
            console.warn('Asset refresh not supported in current environment:', error);
        }
    }

    async selectNode(uuid: string): Promise<void> {
        if (this.isDevMode) {
            console.log(`[Mock] Selecting node: ${uuid}`);
            return;
        }

        try {
            if ((window as any).Editor && (window as any).Editor.Message) {
                return await (window as any).Editor.Message.send('scene', 'select-node', uuid);
            }
        } catch (error) {
            console.warn('Node selection not supported in current environment:', error);
        }
    }

    async createNode(name: string, parent?: string): Promise<string> {
        if (this.isDevMode) {
            const mockUuid = 'mock-node-' + Date.now();
            console.log(`[Mock] Creating node: ${name}, parent: ${parent}, uuid: ${mockUuid}`);
            return mockUuid;
        }

        try {
            if ((window as any).Editor && (window as any).Editor.Message) {
                const result = await (window as any).Editor.Message.request('scene', 'create-node', name, parent);
                return result.uuid || result;
            }
        } catch (error) {
            console.warn('Node creation not supported in current environment:', error);
        }

        return 'unsupported-' + Date.now();
    }

    async deleteNode(uuid: string): Promise<void> {
        if (this.isDevMode) {
            console.log(`[Mock] Deleting node: ${uuid}`);
            return;
        }

        try {
            if ((window as any).Editor && (window as any).Editor.Message) {
                return await (window as any).Editor.Message.send('scene', 'delete-node', uuid);
            }
        } catch (error) {
            console.warn('Node deletion not supported in current environment:', error);
        }
    }
}

// 创建全局实例
export const cocosEditorBridge = new CocosEditorBridge();

// 导出类型和实例
export default cocosEditorBridge;