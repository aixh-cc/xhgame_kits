
import { IGetPackagesRes, IGetVersionRes, IInstallRes, IUninstallRes } from '../common/defined';
import { apiService } from './api-service';

class CocosEditorBridge {

    private isDevMode: boolean = false;

    constructor() {
        this.isDevMode = import.meta.env.DEV || !(window as any).Editor;
    }

    async requestMessage(target: string, method: string, args?: any): Promise<any> {
        if (this.isDevMode) {
            return apiService.nodejsMessage(target, method, args)
        }
        if ((window as any).Editor && (window as any).Editor.Message) {
            return (window as any).Editor.Message.request(target, method, args);
        }
        throw new Error('Editor API not available');
    }

    async getVersion(): Promise<IGetVersionRes> {
        return this.requestMessage('xhgame_plugin', 'get-version');
    }
    async getPackages(target?: string): Promise<IGetPackagesRes> {
        return this.requestMessage('xhgame_plugin', 'get-packages', { target });
    }
    async installComponent(param: { compName: string }): Promise<IInstallRes> {
        return this.requestMessage('xhgame_plugin', 'install-component', param);
    }
    async uninstallComponent(param: { compName: string }): Promise<IUninstallRes> {
        try {
            const result = await this.requestMessage('xhgame_plugin', 'uninstall-component', param);
            console.log(`🎮 [CocosEditorBridge] Uninstalled component:`, result);
            return result;
        } catch (error) {
            console.error('❌ [CocosEditorBridge] Failed to uninstall component:', error);
            throw error;
        }
    }

}

// 创建全局实例
export const cocosEditorBridge = new CocosEditorBridge();

// 导出类型和实例
export default cocosEditorBridge;