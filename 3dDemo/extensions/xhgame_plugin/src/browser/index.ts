import { name } from '../../package.json' with { type: 'json' };
import * as fs from 'fs';
import * as path from 'path';

// 配置文件接口定义
interface PluginConfig {
    version: string;
    installedComponents: InstalledComponent[];
    lastUpdated: string;
}

interface InstalledComponent {
    componentName: string;
    componentId: string;
    componentCode: string;
    version: string;
    installedAt: string;
    copiedFiles: string[];
}

// 配置文件管理工具
class ConfigManager {
    private static configPath: string;

    static init() {
        this.ensureConfigPath();
    }

    private static ensureConfigPath() {
        if (this.configPath) {
            return; // 已经初始化过了
        }

        // 尝试通过Editor.Package.getPath获取路径
        const packagePath = Editor.Package.getPath(name);
        console.log('[ConfigManager] Editor.Package.getPath', packagePath);
        
        if (packagePath) {
            // 如果能获取到包路径，使用标准方式
            const extensionsPath = path.dirname(path.dirname(packagePath));
            this.configPath = path.join(extensionsPath, 'xhgame-plugin-config.json');
            console.log(`[ConfigManager] 使用标准路径: ${this.configPath}`);
        } else {
            // 如果获取不到，使用备用方案：通过Editor.Project.path构建
            const projectPath = Editor.Project.path;
            if (projectPath) {
                this.configPath = path.join(projectPath, 'xhgame-plugin-config.json');
                console.log(`[ConfigManager] 使用备用路径: ${this.configPath}`);
            } else {
                console.error('[ConfigManager] 无法确定配置文件路径，Editor API可能未就绪');
                // 设置一个临时路径，稍后重试
                this.configPath = '';
            }
        }
    }

    static async readConfig(): Promise<PluginConfig> {
        try {
            this.ensureConfigPath();
            if (!this.configPath) {
                console.error('[ConfigManager] 配置文件路径未初始化');
                return {
                    version: '1.0.0',
                    installedComponents: [],
                    lastUpdated: new Date().toISOString()
                };
            }

            if (!fs.existsSync(this.configPath)) {
                // 如果配置文件不存在，创建默认配置
                const defaultConfig: PluginConfig = {
                    version: '1.0.0',
                    installedComponents: [],
                    lastUpdated: new Date().toISOString()
                };
                await this.writeConfig(defaultConfig);
                return defaultConfig;
            }

            const configData = await fs.promises.readFile(this.configPath, 'utf-8');
            return JSON.parse(configData) as PluginConfig;
        } catch (error) {
            console.error('[ConfigManager] 读取配置文件失败:', error);
            // 返回默认配置
            return {
                version: '1.0.0',
                installedComponents: [],
                lastUpdated: new Date().toISOString()
            };
        }
    }

    static async writeConfig(config: PluginConfig): Promise<void> {
        try {
            this.ensureConfigPath();
            if (!this.configPath) {
                throw new Error('配置文件路径未初始化');
            }

            config.lastUpdated = new Date().toISOString();
            const configData = JSON.stringify(config, null, 2);
            await fs.promises.writeFile(this.configPath, configData, 'utf-8');
            console.log('[ConfigManager] 配置文件已保存');
        } catch (error) {
            console.error('[ConfigManager] 写入配置文件失败:', error);
            throw error;
        }
    }

    static async addInstalledComponent(component: Omit<InstalledComponent, 'installedAt'>): Promise<void> {
        try {
            const config = await this.readConfig();

            // 检查是否已经安装过该组件
            const existingIndex = config.installedComponents.findIndex(
                c => c.componentCode === component.componentCode
            );

            const newComponent: InstalledComponent = {
                ...component,
                installedAt: new Date().toISOString()
            };

            if (existingIndex >= 0) {
                // 更新已存在的组件信息
                config.installedComponents[existingIndex] = newComponent;
                console.log(`[ConfigManager] 更新组件信息: ${component.componentName}`);
            } else {
                // 添加新组件
                config.installedComponents.push(newComponent);
                console.log(`[ConfigManager] 添加新组件: ${component.componentName}`);
            }

            await this.writeConfig(config);
        } catch (error) {
            console.error('[ConfigManager] 添加已安装组件失败:', error);
            throw error;
        }
    }

    static async getInstalledComponents(): Promise<InstalledComponent[]> {
        try {
            const config = await this.readConfig();
            return config.installedComponents;
        } catch (error) {
            console.error('[ConfigManager] 获取已安装组件列表失败:', error);
            return [];
        }
    }

    static async removeInstalledComponent(componentCode: string): Promise<void> {
        try {
            const config = await this.readConfig();
            config.installedComponents = config.installedComponents.filter(
                c => c.componentCode !== componentCode
            );
            await this.writeConfig(config);
            console.log(`[ConfigManager] 移除组件: ${componentCode}`);
        } catch (error) {
            console.error('[ConfigManager] 移除已安装组件失败:', error);
            throw error;
        }
    }

    // 本地组件配置管理
    static async readLocalComponentsConfig(): Promise<{ [key: string]: any }> {
        try {
            this.ensureConfigPath();
            if (!this.configPath) {
                console.error('[ConfigManager] 配置文件路径未初始化');
                return {};
            }

            // 直接使用this.configPath，因为它已经指向正确的配置文件
            console.log(`[ConfigManager] 读取本地组件配置文件: ${this.configPath}`);

            if (!fs.existsSync(this.configPath)) {
                console.log(`[ConfigManager] 本地组件配置文件不存在: ${this.configPath}`);
                return {};
            }

            const configContent = await fs.promises.readFile(this.configPath, 'utf-8');
            const config = JSON.parse(configContent);
            return config.localComponents || {};
        } catch (error) {
            console.error(`[ConfigManager] 读取本地组件配置文件失败:`, error);
            return {};
        }
    }

    static async writeLocalComponentsConfig(localComponents: { [key: string]: any }): Promise<void> {
        try {
            this.ensureConfigPath();
            if (!this.configPath) {
                throw new Error('配置文件路径未初始化');
            }

            console.log(`[ConfigManager] 写入本地组件配置文件: ${this.configPath}`);

            let config: any = {};
            if (fs.existsSync(this.configPath)) {
                const configContent = await fs.promises.readFile(this.configPath, 'utf-8');
                config = JSON.parse(configContent);
            }

            config.localComponents = localComponents;
            config.lastUpdated = new Date().toISOString();

            await fs.promises.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
            console.log(`[ConfigManager] 写入本地组件配置成功: ${this.configPath}`);
        } catch (error) {
            console.error(`[ConfigManager] 写入本地组件配置文件失败:`, error);
            throw error;
        }
    }
}

export const methods = {
    async open() {
        return Editor.Panel.open(name);
    },
    getVersion() {
        return Editor.App.version;
    },

    // 获取已安装的组件列表
    async getInstalledComponents() {
        try {
            const components = await ConfigManager.getInstalledComponents();
            console.log(`[xhgame_plugin] 获取已安装组件列表，共 ${components.length} 个组件`);
            return {
                success: true,
                components: components
            };
        } catch (error) {
            console.error(`[xhgame_plugin] 获取已安装组件列表失败:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                components: []
            };
        }
    },

    // 移除已安装的组件记录
    async removeInstalledComponent(param: any) {
        const { componentCode } = param;

        if (!componentCode) {
            return {
                success: false,
                error: '组件代码不能为空'
            };
        }

        try {
            await ConfigManager.removeInstalledComponent(componentCode);
            console.log(`[xhgame_plugin] 已移除组件记录: ${componentCode}`);
            return {
                success: true,
                message: `组件 ${componentCode} 记录已移除`
            };
        } catch (error) {
            console.error(`[xhgame_plugin] 移除组件记录失败:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },

    // 获取本地组件库列表
    async getLocalComponents() {
        try {
            const packagePath = path.join(Editor.Package.getPath(name) || '', 'assets', 'packages');
            console.log(`[xhgame_plugin] 扫描本地组件库路径: ${packagePath}`);

            if (!fs.existsSync(packagePath)) {
                console.log(`[xhgame_plugin] 本地组件库路径不存在: ${packagePath}`);
                return {
                    success: true,
                    components: [],
                    error: ''
                };
            }

            // 读取本地组件配置文件
            const localComponentsConfig = await ConfigManager.readLocalComponentsConfig();
            console.log(`[xhgame_plugin] 读取本地组件配置: ${Object.keys(localComponentsConfig).length} 个组件`);

            const components = [];
            const items = await fs.promises.readdir(packagePath);

            for (const item of items) {
                const itemPath = path.join(packagePath, item);
                const stat = await fs.promises.stat(itemPath);

                // 跳过文件，只处理目录
                if (!stat.isDirectory()) {
                    continue;
                }

                // 查找对应的 .info 文件
                const infoFilePath = path.join(packagePath, `${item}.info`);

                if (fs.existsSync(infoFilePath)) {
                    try {
                        const infoContent = await fs.promises.readFile(infoFilePath, 'utf-8');
                        const componentInfo = JSON.parse(infoContent);

                        // 添加本地组件标识和路径
                        componentInfo.isLocal = true;
                        componentInfo.localPath = itemPath;

                        // 从配置文件获取安装状态
                        const componentConfig = localComponentsConfig[item];
                        if (componentConfig) {
                            componentInfo.status = componentConfig.status;
                            componentInfo.installDate = componentConfig.installDate;
                            componentInfo.installPath = componentConfig.installPath;
                        } else {
                            componentInfo.status = 'available';
                        }

                        components.push(componentInfo);
                        console.log(`[xhgame_plugin] 发现本地组件: ${item}, 状态: ${componentInfo.status}`);
                    } catch (error) {
                        console.error(`[xhgame_plugin] 解析组件信息文件失败 ${infoFilePath}:`, error);
                        // 如果解析失败，创建基本信息
                        components.push({
                            name: item,
                            displayName: item,
                            version: '1.0.0',
                            description: '本地组件',
                            isLocal: true,
                            localPath: itemPath,
                            status: 'unknown'
                        });
                    }
                } else {
                    console.log(`[xhgame_plugin] 组件 ${item} 缺少 .info 文件`);
                    // 没有 .info 文件的组件，创建基本信息
                    components.push({
                        name: item,
                        displayName: item,
                        version: '1.0.0',
                        description: '本地组件（缺少详细信息）',
                        isLocal: true,
                        localPath: itemPath,
                        status: 'no_info'
                    });
                }
            }

            console.log(`[xhgame_plugin] 获取本地组件库列表，共 ${components.length} 个组件`);
            console.log('components', JSON.stringify(components));

            return {
                success: true,
                components: components,
                error: ''
            };
        } catch (error) {
            console.error(`[xhgame_plugin] 获取本地组件库列表失败:`, error);
            return {
                success: false,
                components: [],
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },

    // 从插件assets安装组件的消息处理器
    async installFromAssets(param: any) {

        const { componentName, componentId, componentCode } = param;

        console.log(`[xhgame_plugin] 从内置资源安装组件请求: ${componentName}, ID: ${componentId}`);

        try {
            // 获取插件assets目录路径
            const extensionPath = Editor.Package.getPath(name);
            if (!extensionPath) {
                throw new Error('无法获取插件路径');
            }
            const assetsSourcePath = path.join(extensionPath, 'assets', 'packages', componentCode);

            // 获取项目assets/script目录路径
            const projectPath = Editor.Project.path;
            const targetPath = path.join(projectPath, 'assets');

            // 确保目标目录存在
            await fs.promises.mkdir(targetPath, { recursive: true });

            console.log(`[xhgame_plugin] 源路径: ${assetsSourcePath}`);
            console.log(`[xhgame_plugin] 目标路径: ${targetPath}`);

            // 复制所有assets目录下的文件到项目script目录
            const copiedFiles: string[] = [];
            const conflictFiles: string[] = [];

            // 先检查是否有同名文件冲突
            async function checkConflicts(srcDir: string, destDir: string, relativePath: string = '') {
                const items = await fs.promises.readdir(srcDir, { withFileTypes: true });

                for (const item of items) {
                    const destPath = path.join(destDir, item.name);
                    const relPath = path.join(relativePath, item.name);

                    // 跳过.meta文件
                    if (item.name.endsWith('.meta')) {
                        continue;
                    }

                    if (item.isDirectory()) {
                        // 检查目录下的文件
                        const srcSubDir = path.join(srcDir, item.name);
                        await checkConflicts(srcSubDir, destPath, relPath);
                    } else {
                        // 检查文件是否已存在
                        try {
                            await fs.promises.access(destPath);
                            conflictFiles.push(relPath);
                        } catch (error) {
                            // 文件不存在，没有冲突
                        }
                    }
                }
            }

            // 先检查冲突
            await checkConflicts(assetsSourcePath, targetPath);

            // 如果有冲突文件，返回错误
            if (conflictFiles.length > 0) {
                console.log(`[xhgame_plugin] 检测到冲突文件: ${conflictFiles.join('\n')}`);
                return {
                    success: false,
                    message: `安装失败：检测到以下文件已存在，请先删除或备份这些文件：\n${conflictFiles.join('\n')}`,
                    conflictFiles: conflictFiles
                };
            }
            console.log(`[xhgame_plugin] 没有冲突文件，开始复制...`);

            async function copyDirectory(srcDir: string, destDir: string, relativePath: string = '') {
                const items = await fs.promises.readdir(srcDir, { withFileTypes: true });

                for (const item of items) {
                    const srcPath = path.join(srcDir, item.name);
                    const destPath = path.join(destDir, item.name);
                    const relPath = path.join(relativePath, item.name);

                    // 跳过.meta文件
                    if (item.name.endsWith('.meta')) {
                        continue;
                    }

                    if (item.isDirectory()) {
                        // 创建目录
                        await fs.promises.mkdir(destPath, { recursive: true });
                        await copyDirectory(srcPath, destPath, relPath);
                    } else {
                        // 复制文件
                        await Editor.Utils.File.copy(srcPath, destPath);
                        copiedFiles.push(relPath);
                        console.log(`[xhgame_plugin] 复制文件: ${relPath}`);
                    }
                }
            }

            await copyDirectory(assetsSourcePath, targetPath);

            console.log(`[xhgame_plugin] 组件安装完成，共复制 ${copiedFiles.length} 个文件`);

            // 记录安装信息到配置文件
            try {
                await ConfigManager.addInstalledComponent({
                    componentName,
                    componentId,
                    componentCode,
                    version: '1.0.0', // 可以从param中获取或从组件包信息中读取
                    copiedFiles: copiedFiles
                });
                console.log(`[xhgame_plugin] 组件安装信息已记录到配置文件`);
            } catch (configError) {
                console.warn(`[xhgame_plugin] 记录安装信息失败，但组件安装成功:`, configError);
                // 不影响安装结果，只是记录失败
            }

            return {
                success: true,
                message: `组件 ${componentName} 从内置资源安装成功！`,
                copiedFiles: copiedFiles
            };

        } catch (error) {
            console.error(`[xhgame_plugin] 从内置资源安装组件失败: `, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },

    // 安装本地组件
    async installLocalComponent(param: any) {
        const { componentName, componentCode, localPath } = param;

        console.log(`[xhgame_plugin] 安装本地组件请求: ${componentName}, 路径: ${localPath}`);

        try {
            // 获取项目assets目录路径
            const projectPath = Editor.Project.path;
            const targetPath = path.join(projectPath, 'assets');

            // 确保目标目录存在
            await fs.promises.mkdir(targetPath, { recursive: true });

            console.log(`[xhgame_plugin] 源路径: ${localPath}`);
            console.log(`[xhgame_plugin] 目标路径: ${targetPath}`);

            // 复制所有文件到项目assets目录
            const copiedFiles: string[] = [];
            const conflictFiles: string[] = [];

            // 先检查是否有同名文件冲突
            async function checkConflicts(srcDir: string, destDir: string, relativePath: string = '') {
                const items = await fs.promises.readdir(srcDir, { withFileTypes: true });

                for (const item of items) {
                    const destPath = path.join(destDir, item.name);
                    const relPath = path.join(relativePath, item.name);

                    // 跳过.meta文件和.info文件
                    if (item.name.endsWith('.meta') || item.name.endsWith('.info')) {
                        continue;
                    }

                    if (item.isDirectory()) {
                        // 检查目录下的文件
                        const srcSubDir = path.join(srcDir, item.name);
                        await checkConflicts(srcSubDir, destPath, relPath);
                    } else {
                        // 检查文件是否已存在
                        try {
                            await fs.promises.access(destPath);
                            conflictFiles.push(relPath);
                        } catch (error) {
                            // 文件不存在，没有冲突
                        }
                    }
                }
            }

            // 先检查冲突
            await checkConflicts(localPath, targetPath);

            // 如果有冲突文件，返回错误
            if (conflictFiles.length > 0) {
                console.log(`[xhgame_plugin] 检测到冲突文件: ${conflictFiles.join('\n')}`);
                return {
                    success: false,
                    message: `安装失败：检测到以下文件已存在，请先删除或备份这些文件：\n${conflictFiles.join('\n')}`,
                    conflictFiles: conflictFiles
                };
            }
            console.log(`[xhgame_plugin] 没有冲突文件，开始复制...`);

            async function copyDirectory(srcDir: string, destDir: string, relativePath: string = '') {
                const items = await fs.promises.readdir(srcDir, { withFileTypes: true });

                for (const item of items) {
                    const srcPath = path.join(srcDir, item.name);
                    const destPath = path.join(destDir, item.name);
                    const relPath = path.join(relativePath, item.name);

                    // 跳过.meta文件和.info文件
                    if (item.name.endsWith('.meta') || item.name.endsWith('.info')) {
                        continue;
                    }

                    if (item.isDirectory()) {
                        // 创建目录
                        await fs.promises.mkdir(destPath, { recursive: true });
                        await copyDirectory(srcPath, destPath, relPath);
                    } else {
                        // 复制文件
                        await Editor.Utils.File.copy(srcPath, destPath);
                        copiedFiles.push(relPath);
                        console.log(`[xhgame_plugin] 复制文件: ${relPath}`);
                    }
                }
            }

            await copyDirectory(localPath, targetPath);

            console.log(`[xhgame_plugin] 本地组件安装完成，共复制 ${copiedFiles.length} 个文件`);

            // 记录安装信息到配置文件
            try {
                await ConfigManager.addInstalledComponent({
                    componentName,
                    componentId: componentCode, // 使用componentCode作为ID
                    componentCode,
                    version: '1.0.0', // 可以从.info文件中读取
                    copiedFiles: copiedFiles
                });
                console.log(`[xhgame_plugin] 本地组件安装信息已记录到配置文件`);
            } catch (configError) {
                console.warn(`[xhgame_plugin] 记录安装信息失败，但组件安装成功:`, configError);
                // 不影响安装结果，只是记录失败
            }

            // 更新本地组件配置文件中的状态
            try {
                const localComponentsConfig = await ConfigManager.readLocalComponentsConfig();
                localComponentsConfig[componentCode] = {
                    status: 'installed',
                    installDate: new Date().toISOString(),
                    installPath: targetPath
                };
                await ConfigManager.writeLocalComponentsConfig(localComponentsConfig);
                console.log(`[xhgame_plugin] 本地组件状态已更新为已安装: ${componentCode}`);
            } catch (statusError) {
                console.warn(`[xhgame_plugin] 更新本地组件状态失败:`, statusError);
                // 不影响安装结果，只是状态更新失败
            }

            return {
                success: true,
                message: `本地组件 ${componentName} 安装成功！`,
                copiedFiles: copiedFiles
            };

        } catch (error) {
            console.error(`[xhgame_plugin] 安装本地组件失败: `, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },

    async uninstallComponent(param: any) {
        const { componentCode } = param;

        console.log(`[xhgame_plugin] 卸载组件请求: ${componentCode}`);

        try {
            // 获取已安装组件信息
            const config = await ConfigManager.readConfig();
            const component = config.installedComponents.find(c => c.componentCode === componentCode);

            if (!component) {
                return {
                    success: false,
                    message: `未找到组件 ${componentCode} 的安装记录`
                };
            }

            console.log(`[xhgame_plugin] 找到组件: ${component.componentName}, 文件数量: ${component.copiedFiles.length}`);

            // 获取项目路径
            const projectPath = Editor.Project.path;
            const assetsPath = path.join(projectPath, 'assets');

            // 创建备份目录
            const extensionPath = Editor.Package.getPath(name);
            if (!extensionPath) {
                throw new Error('无法获取插件路径');
            }
            const backupDir = path.join(extensionPath, 'backup');
            await fs.promises.mkdir(backupDir, { recursive: true });

            // 使用组件名作为备份文件夹名称（简化版本，只保留一个备份）
            const backupFolderName = componentCode;
            const componentBackupDir = path.join(backupDir, backupFolderName);
            
            // 如果已存在旧备份，先删除
            if (fs.existsSync(componentBackupDir)) {
                await fs.promises.rm(componentBackupDir, { recursive: true });
                console.log(`[xhgame_plugin] 删除旧备份目录: ${componentBackupDir}`);
            }
            
            await fs.promises.mkdir(componentBackupDir, { recursive: true });

            console.log(`[xhgame_plugin] 备份目录: ${componentBackupDir}`);

            // 备份和删除文件
            const backedUpFiles: string[] = [];
            const deletedFiles: string[] = [];
            const notFoundFiles: string[] = [];

            for (const relativeFilePath of component.copiedFiles) {
                const fullFilePath = path.join(assetsPath, relativeFilePath);
                const metaFilePath = fullFilePath + '.meta';
                const relativeMetaFilePath = relativeFilePath + '.meta';

                try {
                    // 检查文件是否存在
                    await fs.promises.access(fullFilePath);

                    // 创建备份文件的目录结构
                    const backupFilePath = path.join(componentBackupDir, relativeFilePath);
                    const backupFileDir = path.dirname(backupFilePath);
                    await fs.promises.mkdir(backupFileDir, { recursive: true });

                    // 备份文件
                    await Editor.Utils.File.copy(fullFilePath, backupFilePath);
                    backedUpFiles.push(relativeFilePath);
                    console.log(`[xhgame_plugin] 备份文件: ${relativeFilePath}`);

                    // 删除原文件
                    await fs.promises.unlink(fullFilePath);
                    deletedFiles.push(relativeFilePath);
                    console.log(`[xhgame_plugin] 删除文件: ${relativeFilePath}`);

                } catch (error) {
                    console.warn(`[xhgame_plugin] 文件不存在或处理失败: ${relativeFilePath}`, error);
                    notFoundFiles.push(relativeFilePath);
                }

                // 处理对应的.meta文件
                try {
                    // 检查.meta文件是否存在
                    await fs.promises.access(metaFilePath);

                    // 创建备份.meta文件的目录结构
                    const backupMetaFilePath = path.join(componentBackupDir, relativeMetaFilePath);
                    const backupMetaFileDir = path.dirname(backupMetaFilePath);
                    await fs.promises.mkdir(backupMetaFileDir, { recursive: true });

                    // 备份.meta文件
                    await Editor.Utils.File.copy(metaFilePath, backupMetaFilePath);
                    backedUpFiles.push(relativeMetaFilePath);
                    console.log(`[xhgame_plugin] 备份.meta文件: ${relativeMetaFilePath}`);

                    // 删除原.meta文件
                    await fs.promises.unlink(metaFilePath);
                    deletedFiles.push(relativeMetaFilePath);
                    console.log(`[xhgame_plugin] 删除.meta文件: ${relativeMetaFilePath}`);

                } catch (error) {
                    // .meta文件可能不存在，这是正常的，不记录为错误
                    console.log(`[xhgame_plugin] .meta文件不存在或已删除: ${relativeMetaFilePath}`);
                }
            }

            // 处理组件目录的.meta文件
            const processedDirs = new Set<string>();
            for (const relativeFilePath of component.copiedFiles) {
                const dirPath = path.dirname(relativeFilePath);
                
                // 避免重复处理同一个目录
                if (processedDirs.has(dirPath)) {
                    continue;
                }
                processedDirs.add(dirPath);

                const fullDirPath = path.join(assetsPath, dirPath);
                const dirMetaFilePath = fullDirPath + '.meta';
                const relativeDirMetaFilePath = dirPath + '.meta';

                try {
                    // 检查目录的.meta文件是否存在
                    await fs.promises.access(dirMetaFilePath);

                    // 创建备份目录.meta文件的目录结构
                    const backupDirMetaFilePath = path.join(componentBackupDir, relativeDirMetaFilePath);
                    const backupDirMetaFileDir = path.dirname(backupDirMetaFilePath);
                    await fs.promises.mkdir(backupDirMetaFileDir, { recursive: true });

                    // 备份目录.meta文件
                    await Editor.Utils.File.copy(dirMetaFilePath, backupDirMetaFilePath);
                    backedUpFiles.push(relativeDirMetaFilePath);
                    console.log(`[xhgame_plugin] 备份目录.meta文件: ${relativeDirMetaFilePath}`);

                    // 删除原目录.meta文件
                    await fs.promises.unlink(dirMetaFilePath);
                    deletedFiles.push(relativeDirMetaFilePath);
                    console.log(`[xhgame_plugin] 删除目录.meta文件: ${relativeDirMetaFilePath}`);

                } catch (error) {
                    // 目录.meta文件可能不存在，这是正常的，不记录为错误
                    console.log(`[xhgame_plugin] 目录.meta文件不存在或已删除: ${relativeDirMetaFilePath}`);
                }
            }

            // 清理空目录
            const cleanupEmptyDirs = async (dirPath: string) => {
                try {
                    const items = await fs.promises.readdir(dirPath);

                    // 递归清理子目录
                    for (const item of items) {
                        const itemPath = path.join(dirPath, item);
                        const stat = await fs.promises.stat(itemPath);
                        if (stat.isDirectory()) {
                            await cleanupEmptyDirs(itemPath);
                        }
                    }

                    // 检查目录是否为空
                    const remainingItems = await fs.promises.readdir(dirPath);
                    if (remainingItems.length === 0) {
                        await fs.promises.rmdir(dirPath);
                        console.log(`[xhgame_plugin] 删除空目录: ${dirPath}`);
                    }
                } catch (error) {
                    // 忽略清理目录时的错误
                }
            };

            // 从assets目录开始清理空目录
            await cleanupEmptyDirs(assetsPath);

            // 从配置中移除组件记录
            await ConfigManager.removeInstalledComponent(componentCode);

            // 更新本地组件配置文件中的状态
            try {
                const localComponentsConfig = await ConfigManager.readLocalComponentsConfig();
                if (localComponentsConfig[componentCode]) {
                    localComponentsConfig[componentCode].status = 'available';
                    delete localComponentsConfig[componentCode].installDate;
                    delete localComponentsConfig[componentCode].installPath;
                    await ConfigManager.writeLocalComponentsConfig(localComponentsConfig);
                    console.log(`[xhgame_plugin] 本地组件状态已更新为可用: ${componentCode}`);
                }
            } catch (statusError) {
                console.warn(`[xhgame_plugin] 更新本地组件状态失败:`, statusError);
                // 不影响卸载结果，只是状态更新失败
            }

            // 创建备份信息文件
            const backupInfo = {
                componentName: component.componentName,
                componentId: component.componentId,
                componentCode: component.componentCode,
                version: component.version,
                originalInstallTime: component.installedAt,
                uninstallTime: new Date().toISOString(),
                backedUpFiles: backedUpFiles,
                deletedFiles: deletedFiles,
                notFoundFiles: notFoundFiles
            };

            const backupInfoPath = path.join(componentBackupDir, 'backup-info.json');
            await fs.promises.writeFile(backupInfoPath, JSON.stringify(backupInfo, null, 2), 'utf-8');

            console.log(`[xhgame_plugin] 组件卸载完成: ${component.componentName}`);
            console.log(`[xhgame_plugin] 备份文件数: ${backedUpFiles.length}, 删除文件数: ${deletedFiles.length}, 未找到文件数: ${notFoundFiles.length}`);

            return {
                success: true,
                message: `组件 ${component.componentName} 卸载成功！\n备份位置: ${backupFolderName}`,
                backupPath: componentBackupDir,
                backedUpFiles: backedUpFiles,
                deletedFiles: deletedFiles,
                notFoundFiles: notFoundFiles
            };

        } catch (error) {
            console.error(`[xhgame_plugin] 卸载组件失败: `, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },

    // 检查组件是否有备份文件
    async checkBackupExists(param: any) {
        const { componentCode } = param;

        if (!componentCode) {
            return {
                success: false,
                error: '组件代码不能为空'
            };
        }

        try {
            const extensionPath = Editor.Package.getPath(name);
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
    },

    // 从备份恢复组件
    async restoreFromBackup(param: any) {
        const { componentCode } = param;

        if (!componentCode) {
            return {
                success: false,
                error: '组件代码不能为空'
            };
        }

        try {
            const extensionPath = Editor.Package.getPath(name);
            if (!extensionPath) {
                throw new Error('无法获取插件路径');
            }

            const backupDir = path.join(extensionPath, 'backup');
            
            if (!fs.existsSync(backupDir)) {
                return {
                    success: false,
                    error: '备份目录不存在'
                };
            }

            // 直接使用组件名目录
            const componentBackupDir = componentCode;
            const backupPath = path.join(backupDir, componentBackupDir);
            
            if (!fs.existsSync(backupPath)) {
                return {
                    success: false,
                    error: '未找到该组件的备份文件'
                };
            }
            const backupInfoPath = path.join(backupPath, 'backup-info.json');

            if (!fs.existsSync(backupInfoPath)) {
                return {
                    success: false,
                    error: '备份信息文件不存在'
                };
            }

            // 读取备份信息
            const backupInfo = JSON.parse(await fs.promises.readFile(backupInfoPath, 'utf-8'));
            console.log(`[xhgame_plugin] 开始恢复组件: ${backupInfo.componentName}`);

            // 获取项目路径
            const projectPath = Editor.Project.path;
            const assetsPath = path.join(projectPath, 'assets');

            // 恢复文件
            const restoredFiles: string[] = [];
            const failedFiles: string[] = [];

            for (const relativeFilePath of backupInfo.backedUpFiles) {
                try {
                    const backupFilePath = path.join(backupPath, relativeFilePath);
                    const targetFilePath = path.join(assetsPath, relativeFilePath);
                    
                    // 确保目标目录存在
                    const targetDir = path.dirname(targetFilePath);
                    await fs.promises.mkdir(targetDir, { recursive: true });

                    // 复制文件
                    await fs.promises.copyFile(backupFilePath, targetFilePath);
                    restoredFiles.push(relativeFilePath);
                    console.log(`[xhgame_plugin] 恢复文件: ${relativeFilePath}`);

                    // 如果有对应的.meta文件也恢复
                    const backupMetaPath = backupFilePath + '.meta';
                    const targetMetaPath = targetFilePath + '.meta';
                    if (fs.existsSync(backupMetaPath)) {
                        await fs.promises.copyFile(backupMetaPath, targetMetaPath);
                        console.log(`[xhgame_plugin] 恢复meta文件: ${relativeFilePath}.meta`);
                    }

                } catch (error) {
                    console.error(`[xhgame_plugin] 恢复文件失败 ${relativeFilePath}:`, error);
                    failedFiles.push(relativeFilePath);
                }
            }

            // 重新添加到已安装组件列表
            try {
                await ConfigManager.addInstalledComponent({
                    componentName: backupInfo.componentName,
                    componentId: backupInfo.componentId,
                    componentCode: backupInfo.componentCode,
                    version: backupInfo.version,
                    copiedFiles: restoredFiles
                });
                console.log(`[xhgame_plugin] 组件恢复信息已记录到配置文件`);
            } catch (configError) {
                console.warn(`[xhgame_plugin] 记录恢复信息失败，但文件恢复成功:`, configError);
            }

            // 更新本地组件配置文件中的状态
            try {
                const localComponentsConfig = await ConfigManager.readLocalComponentsConfig();
                localComponentsConfig[componentCode] = {
                    status: 'installed',
                    installDate: new Date().toISOString(),
                    installPath: assetsPath
                };
                await ConfigManager.writeLocalComponentsConfig(localComponentsConfig);
                console.log(`[xhgame_plugin] 本地组件状态已更新为已安装: ${componentCode}`);
            } catch (statusError) {
                console.warn(`[xhgame_plugin] 更新本地组件状态失败:`, statusError);
            }

            // 删除已使用的备份目录
            try {
                await fs.promises.rm(backupPath, { recursive: true });
                console.log(`[xhgame_plugin] 已删除使用过的备份目录: ${backupPath}`);
            } catch (deleteError) {
                console.warn(`[xhgame_plugin] 删除备份目录失败，但不影响恢复结果:`, deleteError);
            }

            console.log(`[xhgame_plugin] 组件恢复完成: ${backupInfo.componentName}`);
            console.log(`[xhgame_plugin] 恢复文件数: ${restoredFiles.length}, 失败文件数: ${failedFiles.length}`);

            return {
                success: true,
                message: `组件 ${backupInfo.componentName} 恢复成功！`,
                restoredFiles: restoredFiles,
                failedFiles: failedFiles,
                componentInfo: backupInfo
            };

        } catch (error) {
            console.error(`[xhgame_plugin] 恢复组件失败:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
};

export async function load() {
    console.log(`load ${name}`);
    // 初始化配置管理器
    ConfigManager.init();
}

export function unload() {
    console.log(`unload ${name}`);
}
