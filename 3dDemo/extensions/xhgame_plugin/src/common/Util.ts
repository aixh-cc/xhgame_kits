import * as fs from 'fs';
import * as path from 'path';
import { IGetPackagesRes, IGetVersionRes, IPackageInfoWithStatus } from './defined';

export const getPluginPath = (pluginName: string) => {
    if (typeof Editor != 'undefined' && Editor.Project) {
        return path.join(Editor.Project.path, 'extensions', pluginName);
    } else {
        return process.cwd();
    }
};

// 获取项目根目录下的 packages 路径
export const getPackagesPath = (pluginName: string) => {
    let pluginPath = getPluginPath(pluginName);
    return path.join(pluginPath, 'assets', 'packages');
};

export const getExtensionsPath = (pluginName: string) => {
    let pluginPath = getPluginPath(pluginName);
    return path.resolve(pluginPath, '../');
};

export const getProjectPath = (pluginName: string) => {
    let pluginPath = getPluginPath(pluginName);
    return path.resolve(pluginPath, '../../');
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
    static async getVersion(pluginName: string): Promise<IGetVersionRes> {
        const projectPath = getProjectPath(pluginName);
        // 检查备份信息文件是否存在
        const packagePath = path.join(projectPath, 'package.json');
        const hasFile = fs.existsSync(packagePath);
        if (hasFile) {
            const packageInfo = JSON.parse(await fs.promises.readFile(packagePath, 'utf-8'));
            if (typeof packageInfo.creator != 'undefined') {
                return {
                    success: true,
                    version: packageInfo.creator.version
                };
            }
        }
        return {
            success: true,
            version: '未知版本'
        };
    }

    static async getPackages(): Promise<IGetPackagesRes> {
        try {
            const packagesPath = getPackagesPath('xhgame_plugin');
            console.log('packagesPath', packagesPath)

            if (!fs.existsSync(packagesPath)) {
                console.error('Packages directory not found' + packagesPath)
                return {
                    success: false,
                    error: 'Packages directory not found',
                    packagesPath: '',
                    packages: []
                };
            }
            // 当前组件安装情况
            let install = await Util.checkInstallExists({ pluginName: 'xhgame_plugin' })
            console.log('install', install)
            let installedLists = install.installInfo?.installedComponents.map((item: any) => item.componentCode) || []
            console.log('installedLists', installedLists)
            const items = fs.readdirSync(packagesPath);
            const packages = [];

            for (const item of items) {
                const itemPath = path.join(packagesPath, item);
                const stats = fs.statSync(itemPath);

                console.log('itemPath', itemPath)

                if (stats.isDirectory()) {
                    console.error('当前只支持zip')
                } else if (item.endsWith('.zip')) {
                    // 处理 .zip 包文件
                    const zipName = path.basename(item, '.zip');
                    const metaPath = itemPath + '.meta';

                    // let packageInfoWithStatus: IPackageInfoWithStatus = {
                    //     name: zipName,
                    //     version: '',
                    //     installStatus: 'none',
                    //     backupStatus: 'none',
                    // }

                    // 尝试从 .meta 文件读取包信息
                    if (fs.existsSync(metaPath)) {
                        try {
                            const metaContent = fs.readFileSync(metaPath, 'utf-8');
                            const metaData = JSON.parse(metaContent);
                            if (metaData.userData && typeof metaData.userData === 'object') {
                                let packageInfoWithStatus: IPackageInfoWithStatus = metaData.userData
                                // 检查是否已安装
                                packageInfoWithStatus.installStatus = installedLists.includes(packageInfoWithStatus.name) ? 'has' : 'none';
                                // 检查备份状态
                                let backup = await Util.checkBackupExists({ pluginName: 'xhgame_plugin', componentCode: packageInfoWithStatus.name })
                                console.log('backup', backup)
                                if (backup) {
                                    packageInfoWithStatus.backupStatus = backup.backupInfo ? 'has' : 'none';
                                } else {
                                    packageInfoWithStatus.backupStatus = 'none';
                                }
                                packages.push(packageInfoWithStatus);
                            }
                        } catch (error) {
                            console.error(`Error reading meta for ${item}:`, error);
                        }
                    }
                }
            }
            return {
                success: true,
                packagesPath,
                packages
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to get packages',
                packagesPath: '',
                packages: []
            };
        }
    }

    static async checkInstallExists(param: any): Promise<IInstallResult> {
        const { pluginName } = param;
        if (!pluginName) {
            return {
                success: false,
                error: '插件名不能为空',
            };
        }
        try {
            const extensionPath = getExtensionsPath(pluginName);
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