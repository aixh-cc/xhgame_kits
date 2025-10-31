/**
 * Cocos Creator 编辑器通信桥接模块
 * 提供与 Cocos Creator 编辑器的双向通信功能
 */
import { IGetPackagesRes, IGetVersionRes } from '../common/defined';
import { apiService } from './api-service';

export interface CocosEditorAPI {
    // 消息通信
    sendMessage(target: string, method: string, ...args: any[]): Promise<any>;
    requestMessage(target: string, method: string, ...args: any[]): Promise<any>;

    // 事件监听
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    emit(event: string, ...args: any[]): void;

    // 编辑器操作
    getVersion(): Promise<IGetVersionRes>;
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

    // 插件配置操作

    removeInstalledComponent(param: { componentCode: string }): Promise<any>;
    uninstallComponent(param: { componentCode: string }): Promise<any>;

    // 备份文件操作
    checkBackupExists(componentCode: string): Promise<{ exists: boolean; backupPath?: string; backupInfo?: any }>;
    restoreFromBackup(componentCode: string, backupPath: string): Promise<{ success: boolean; message?: string; error?: string; restoredFiles?: string[] }>;
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
            // return this.mockResponse(method, args);
        }
        if ((window as any).Editor && (window as any).Editor.Message) {
            return (window as any).Editor.Message.request(target, method, ...args);
        }

        throw new Error('Editor API not available');
    }

    async requestMessage(target: string, method: string, ...args: any[]): Promise<any> {
        if (this.isDevMode) {
            let res = await apiService.nodejsMessage(target, method, ...args)
            return res.data
        }
        if ((window as any).Editor && (window as any).Editor.Message) {
            return (window as any).Editor.Message.request(target, method, ...args);
        }
        throw new Error('Editor API not available');
    }
    // async nodejsMessage(target: string, method: string, ...args: any[]): Promise<any> {
    //     return await this.sendMessage(target, method, ...args);
    // }

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
    async removeInstalledComponent(param: { componentCode: string }): Promise<any> {
        if (this.isDevMode) {
            console.log(`🔧 [CocosEditorBridge] Mock remove installed component: ${param.componentCode}`);
            return {
                success: true,
                message: `组件 ${param.componentCode} 记录已移除`
            };
        }

        try {
            const result = await this.sendMessage('xhgame_plugin', 'remove-installed-component', param);
            console.log(`🎮 [CocosEditorBridge] Removed installed component:`, result);
            return result;
        } catch (error) {
            console.error('❌ [CocosEditorBridge] Failed to remove installed component:', error);
            throw error;
        }
    }

    async uninstallComponent(param: { componentCode: string }): Promise<any> {
        if (this.isDevMode) {
            console.log(`🔧 [CocosEditorBridge] Mock uninstall component: ${param.componentCode}`);
            return {
                success: true,
                message: `组件 ${param.componentCode} 卸载成功！\n备份位置: HelpAndChat_20241201120000`,
                backupPath: '/mock/backup/path',
                backedUpFiles: ['script/helpAndChat.ts', 'gui/helpAndChat.prefab'],
                deletedFiles: ['script/helpAndChat.ts', 'gui/helpAndChat.prefab'],
                notFoundFiles: []
            };
        }

        try {
            const result = await this.sendMessage('xhgame_plugin', 'uninstall-component', param);
            console.log(`🎮 [CocosEditorBridge] Uninstalled component:`, result);
            return result;
        } catch (error) {
            console.error('❌ [CocosEditorBridge] Failed to uninstall component:', error);
            throw error;
        }
    }

    async checkBackupExists(componentCode: string): Promise<{ exists: boolean; backupPath?: string; backupInfo?: any }> {
        if (this.isDevMode) {
            console.log(`🔧 [CocosEditorBridge] Mock check backup exists: ${componentCode}`);
            // 模拟有备份文件的情况
            return {
                exists: true,
                backupPath: '/mock/backup/path/HelpAndChat_20241201120000',
                backupInfo: {
                    componentName: '帮助与聊天组件',
                    componentCode: componentCode,
                    version: '1.0.0',
                    uninstallTime: '2024-12-01T12:00:00.000Z',
                    backedUpFiles: ['script/component.ts', 'gui/component.prefab']
                }
            };
        }

        try {
            const result = await this.sendMessage('xhgame_plugin', 'checkBackupExists', { componentCode });
            console.log(`🎮 [CocosEditorBridge] Checked backup exists:`, result);
            return {
                exists: result.hasBackup || false,
                backupPath: result.backupPath,
                backupInfo: result.backupInfo
            };
        } catch (error) {
            console.error('❌ [CocosEditorBridge] Failed to check backup exists:', error);
            return {
                exists: false
            };
        }
    }

    async restoreFromBackup(componentCode: string, backupPath: string): Promise<{ success: boolean; message?: string; error?: string; restoredFiles?: string[] }> {
        if (this.isDevMode) {
            console.log(`🔧 [CocosEditorBridge] Mock restore from backup: ${componentCode} from ${backupPath}`);
            return {
                success: true,
                message: `组件 ${componentCode} 从备份恢复成功！`,
                restoredFiles: ['script/component.ts', 'gui/component.prefab']
            };
        }

        try {
            const result = await this.sendMessage('xhgame_plugin', 'restoreFromBackup', { componentCode });
            console.log(`🎮 [CocosEditorBridge] Restored from backup:`, result);
            return {
                success: result.success || false,
                message: result.message,
                error: result.error,
                restoredFiles: result.restoredFiles
            };
        } catch (error) {
            console.error('❌ [CocosEditorBridge] Failed to restore from backup:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '恢复组件时发生未知错误'
            };
        }
    }


    async getVersion(): Promise<IGetVersionRes> {
        return this.requestMessage('xhgame_plugin', 'get-version');
    }
    async getPackages(): Promise<IGetPackagesRes> {
        return this.requestMessage('xhgame_plugin', 'get-packages');
    }

}

// 创建全局实例
export const cocosEditorBridge = new CocosEditorBridge();

// 导出类型和实例
export default cocosEditorBridge;