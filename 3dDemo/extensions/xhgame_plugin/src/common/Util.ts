import * as fs from 'fs';
import * as path from 'path';

export const getPluginPath = (pluginName: string) => {
    // 从当前插件目录向上找到项目根目录
    const currentDir = process.cwd();
    const extensionsRoot = path.resolve(currentDir, '../');
    return path.join(extensionsRoot, pluginName);
};
export const getExtensionsPath = () => {
    // 从当前插件目录向上找到项目根目录
    const currentDir = process.cwd();
    const extensionsRoot = path.resolve(currentDir, '../');
    return extensionsRoot
};

interface IBackupResult {
    success: boolean;
    error?: string;
    hasBackup?: boolean;
    exists?: boolean;
    backupInfo?: any;
    backupPath?: string;
}
interface IInstallResult {
    success: boolean;
    error?: string;
    installInfo?: any
}

export class Util {
    static async checkInstallExists(param: any): Promise<IInstallResult> {
        const { pluginName } = param;
        if (!pluginName) {
            return {
                success: false,
                error: '插件名不能为空',
            };
        }
        try {
            const extensionPath = getExtensionsPath();
            if (!extensionPath) {
                throw new Error('无法获取插件路径');
            }
            // 检查备份信息文件是否存在
            const installInfoPath = path.join(extensionPath, pluginName + '-installInfo.json');
            const hasInstallFile = fs.existsSync(installInfoPath);

            if (hasInstallFile) {
                const installInfo = JSON.parse(await fs.promises.readFile(installInfoPath, 'utf-8'));
                return {
                    success: true,
                    installInfo: installInfo
                };
            } else {
                return {
                    success: true,
                    installInfo: []
                };
            }

        } catch (error) {
            console.error(`[xhgame_plugin] 检查备份文件失败:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    // 检查组件是否有备份文件
    static async checkBackupExists(param: any): Promise<IBackupResult> {
        const { componentCode, pluginName } = param;

        if (!componentCode || !pluginName) {
            return {
                success: false,
                error: '组件代码不能为空或插件名不能为空'
            };
        }

        try {
            const pluginPath = getPluginPath(pluginName);
            if (!pluginPath) {
                throw new Error('无法获取插件路径');
            }

            const backupDir = path.join(pluginPath, 'backup');
            console.log('backupDir', backupDir)
            if (!fs.existsSync(backupDir)) {
                console.log('不存在', backupDir)
                return {
                    success: true,
                    hasBackup: false,
                    exists: false
                };
            }

            // 直接检查组件名目录
            const componentBackupDir = componentCode;
            const componentBackupPath = path.join(backupDir, componentBackupDir);
            console.log('fs.existsSync(componentBackupPath)', componentBackupPath)
            if (!fs.existsSync(componentBackupPath)) {
                return {
                    success: true,
                    hasBackup: false,
                    exists: false
                };
            }

            // 检查备份信息文件是否存在
            const backupInfoPath = path.join(componentBackupPath, 'backup-info.json');
            const hasBackupInfo = fs.existsSync(backupInfoPath);

            if (hasBackupInfo) {
                const backupInfo = JSON.parse(await fs.promises.readFile(backupInfoPath, 'utf-8'));
                return {
                    success: true,
                    hasBackup: true,
                    exists: true,
                    backupInfo: backupInfo,
                    backupPath: componentBackupPath
                };
            } else {
                return {
                    success: true,
                    hasBackup: false,
                    exists: false,
                    backupInfo: null,
                    backupPath: ''
                };
            }

        } catch (error) {
            console.error(`[xhgame_plugin] 检查备份文件失败:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                hasBackup: false,
                exists: false
            };
        }
    }

}