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
        return this.requestMessage('main', 'get-version');
    }
    
    async openPanel(panelName: string): Promise<void> {
        return this.sendMessage('main', 'open-panel', panelName);
    }
    
    async closePanel(panelName: string): Promise<void> {
        return this.sendMessage('main', 'close-panel', panelName);
    }
    
    async selectAsset(uuid: string): Promise<void> {
        return this.sendMessage('asset-db', 'select-asset', uuid);
    }
    
    async importAsset(path: string): Promise<void> {
        return this.sendMessage('asset-db', 'import-asset', path);
    }
    
    async refreshAssets(): Promise<void> {
        return this.sendMessage('asset-db', 'refresh');
    }
    
    async selectNode(uuid: string): Promise<void> {
        return this.sendMessage('scene', 'select-node', uuid);
    }
    
    async createNode(name: string, parent?: string): Promise<string> {
        const result = await this.requestMessage('scene', 'create-node', name, parent);
        return result.uuid || result;
    }
    
    async deleteNode(uuid: string): Promise<void> {
        return this.sendMessage('scene', 'delete-node', uuid);
    }
}

// 创建全局实例
export const cocosEditorBridge = new CocosEditorBridge();

// 导出类型和实例
export default cocosEditorBridge;