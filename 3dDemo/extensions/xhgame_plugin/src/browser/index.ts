import { name } from '../../package.json' with { type: 'json' };
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import AdmZip from 'adm-zip';

export const methods = {
    async open() {
        return Editor.Panel.open(name);
    },
    getVersion() {
        return Editor.App.version;
    },
    // 下载组件的消息处理器
    async downloadComponent(info: any) {
        const { url, targetPaths, name: componentName, isUpdate } = info;

        console.log(`[xhgame_plugin] ${isUpdate ? '更新' : '下载'}组件请求: ${componentName}, URL: ${url}`);

        try {
            // 1. 创建临时目录
            const tempDir = path.join(os.tmpdir(), 'xhgame_plugin', Date.now().toString());
            await fs.promises.mkdir(tempDir, { recursive: true });

            // 2. 下载文件
            console.log(`[xhgame_plugin] 开始下载: ${url}`);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`下载失败: ${response.status} ${response.statusText}`);
            }

            // 获取文件名
            const urlPath = new URL(url).pathname;
            const fileName = path.basename(urlPath) || `${componentName}.zip`;
            const tempFilePath = path.join(tempDir, fileName);

            // 保存文件
            const arrayBuffer = await response.arrayBuffer();
            await fs.promises.writeFile(tempFilePath, Buffer.from(arrayBuffer));

            console.log(`[xhgame_plugin] 文件下载完成: ${tempFilePath}`);

            // 3. 解压文件
            const installedPaths: any[] = [];

            if (fileName.endsWith('.zip')) {
                console.log(`[xhgame_plugin] 开始解压ZIP文件`);
                const zip = new AdmZip(tempFilePath);

                // 为每个目标路径解压
                for (const targetPath of targetPaths) {
                    const extractPath = path.resolve(targetPath.path);

                    // 确保目标目录存在
                    await fs.promises.mkdir(extractPath, { recursive: true });

                    // 解压到目标目录
                    zip.extractAllTo(extractPath, true);

                    // 记录安装的文件
                    const extractedFiles = zip.getEntries().map(entry => ({
                        path: path.join(extractPath, entry.entryName),
                        description: targetPath.description,
                        type: entry.entryName.endsWith('.ts') ? 'SCRIPT' :
                            entry.entryName.endsWith('.prefab') ? 'PREFAB' : 'OTHER'
                    }));

                    installedPaths.push(...extractedFiles);

                    console.log(`[xhgame_plugin] 解压完成到: ${extractPath}`);
                }
            } else {
                // 非ZIP文件，直接复制到目标路径
                for (const targetPath of targetPaths) {
                    const targetDir = path.resolve(targetPath.path);
                    await fs.promises.mkdir(targetDir, { recursive: true });

                    const targetFilePath = path.join(targetDir, fileName);
                    await fs.promises.copyFile(tempFilePath, targetFilePath);

                    installedPaths.push({
                        path: targetFilePath,
                        description: targetPath.description,
                        type: fileName.endsWith('.ts') ? 'SCRIPT' : 'OTHER'
                    });

                    console.log(`[xhgame_plugin] 文件复制完成到: ${targetFilePath}`);
                }
            }

            // 4. 清理临时文件
            try {
                await fs.promises.rm(tempDir, { recursive: true, force: true });
            } catch (cleanupError) {
                console.warn(`[xhgame_plugin] 清理临时文件失败:`, cleanupError);
            }

            // 5. 返回成功信息
            return {
                success: true,
                message: `组件 ${componentName} ${isUpdate ? '更新' : '安装'}成功！`,
                installedPaths: installedPaths
            };

        } catch (error) {
            console.error(`[xhgame_plugin] ${isUpdate ? '更新' : '下载'}组件失败:`, error);
            return {
                success: false,
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
