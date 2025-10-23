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
        // 配置文件存储在extensions目录下
        const extensionsPath = path.dirname(path.dirname(Editor.Package.getPath(name) || ''));
        this.configPath = path.join(extensionsPath, 'xhgame-plugin-config.json');
        console.log(`[ConfigManager] 配置文件路径: ${this.configPath}`);
    }

    static async readConfig(): Promise<PluginConfig> {
        try {
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
}

export const methods = {
    async open() {
        return Editor.Panel.open(name);
    },
    getVersion() {
        return Editor.App.version;
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
};

export async function load() {
    console.log(`load ${name}`);
}

export function unload() {
    console.log(`unload ${name}`);
}
