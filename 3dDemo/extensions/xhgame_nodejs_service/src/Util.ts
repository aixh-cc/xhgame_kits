import * as fs from 'fs';
import * as path from 'path';

export class Util {
    // 检查组件是否有备份文件
    static async checkBackupExists(param: any) {
        const { componentCode } = param;

        if (!componentCode) {
            return {
                success: false,
                error: '组件代码不能为空'
            };
        }

        try {
            const extensionPath = Editor.Package.getPath('xhgame_plugin');
            if (!extensionPath) {
                throw new Error('无法获取插件路径');
            }

            const backupDir = path.join(extensionPath, 'backup');

            if (!fs.existsSync(backupDir)) {
                return {
                    success: true,
                    hasBackup: false,
                    exists: false
                };
            }

            // 直接检查组件名目录
            const componentBackupDir = componentCode;
            const componentBackupPath = path.join(backupDir, componentBackupDir);

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
                    exists: false
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