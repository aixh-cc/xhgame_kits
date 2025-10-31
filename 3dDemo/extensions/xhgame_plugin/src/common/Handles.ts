import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import { IGetPackagesRes, IGetVersionRes, IInstallInfoRes, IInstallRes, IPackageInfoWithStatus, IUninstallRes } from './defined';
import { getExtensionsPath, getPackagesPath, getProjectPath } from './Util';

export class Handles {
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

    static async getPackages(pluginName: string): Promise<IGetPackagesRes> {
        console.log('getPackages', pluginName)
        try {
            const packagesPath = getPackagesPath(pluginName);
            if (!fs.existsSync(packagesPath)) {
                return {
                    success: false,
                    error: 'Packages directory not found',
                    packagesPath: '',
                    packages: []
                };
            }
            // 当前组件安装情况
            let install = await Handles.checkInstallExists({ pluginName: 'xhgame_plugin' })
            let installedLists = install.installInfo?.installedComponents.map((item: any) => item.componentCode) || []
            const items = fs.readdirSync(packagesPath);
            const packages = [];

            for (const item of items) {
                const itemPath = path.join(packagesPath, item);
                const stats = fs.statSync(itemPath);

                if (stats.isDirectory()) {
                    console.error('当前只支持zip')
                } else if (item.endsWith('.zip')) {
                    // 处理 .zip 包文件
                    const zipName = path.basename(item, '.zip');
                    const metaPath = itemPath + '.meta';
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
                                packageInfoWithStatus.backupStatus = 'none';
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
    static async installComponent(param: any): Promise<IInstallRes> {

        const { compName, pluginName } = param;

        console.log(`[xhgame_plugin] 安装组件请求: ${compName}`, param);
        let extractTempDir = '';
        try {
            let packagePath = getPackagesPath(pluginName)
            const zipFilePath = path.join(packagePath, `${compName}.zip`);
            const legacyDirPath = path.join(packagePath, compName);

            // 解压源目录（如果是zip）或使用旧目录模式
            let assetsSourcePath = legacyDirPath;
            if (fs.existsSync(zipFilePath)) {
                console.log(`[xhgame_plugin] 发现zip包，准备解压: ${zipFilePath}`);
                extractTempDir = path.join(packagePath, '__extract', compName);
                await fs.promises.mkdir(extractTempDir, { recursive: true });

                const zip = new AdmZip(zipFilePath);
                zip.extractAllTo(extractTempDir, true);
                console.log(`[xhgame_plugin] 解压完成到: ${extractTempDir}`);

                // 选择正确的根目录：
                // 1) 若存在单个顶级目录（排除 __MACOSX），以该目录为根
                // 2) 若根目录下存在 assets，则以 assets 作为源
                // 3) 否则使用解压根目录
                const topEntries = await fs.promises.readdir(extractTempDir, { withFileTypes: true });
                const candidateDirs = topEntries.filter(e => e.isDirectory() && e.name !== '__MACOSX');
                let baseRoot = extractTempDir;
                if (candidateDirs.length === 1) {
                    baseRoot = path.join(extractTempDir, candidateDirs[0].name);
                }
                const extractedAssetsDir = path.join(baseRoot, 'assets');
                assetsSourcePath = fs.existsSync(extractedAssetsDir) ? extractedAssetsDir : baseRoot;
            } else if (fs.existsSync(legacyDirPath)) {
                console.log(`[xhgame_plugin] 使用旧目录模式: ${legacyDirPath}`);
                assetsSourcePath = legacyDirPath;
            } else {
                return {
                    success: false,
                    error: `未找到组件资源：${zipFilePath} 或 ${legacyDirPath}`
                };
            }

            // 获取项目assets/script目录路径
            const projectPath = getProjectPath(pluginName);
            const targetPath = path.join(projectPath, 'assets');

            // 确保目标目录存在
            await fs.promises.mkdir(targetPath, { recursive: true });

            console.log(`[xhgame_plugin] 源路径: ${assetsSourcePath}`);
            console.log(`[xhgame_plugin] 目标路径: ${targetPath}`);

            // 复制所需文件到项目 assets 目录
            const copiedFiles: string[] = [];
            const conflictFiles: string[] = [];
            const missingFiles: string[] = [];

            // 先检查是否有同名文件冲突
            async function checkConflicts(srcDir: string, destDir: string, relativePath: string = '') {
                const items = await fs.promises.readdir(srcDir, { withFileTypes: true });

                for (const item of items) {
                    const destPath = path.join(destDir, item.name);
                    const relPath = path.join(relativePath, item.name);

                    // 跳过所有 .meta 文件和文件夹
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

            // 若为zip并存在meta，则按meta中的userData.files进行安装
            const metaPath = zipFilePath + '.meta';
            const useMetaList = fs.existsSync(zipFilePath) && fs.existsSync(metaPath);
            if (useMetaList) {
                try {
                    const metaContent = await fs.promises.readFile(metaPath, 'utf-8');
                    const metaData = JSON.parse(metaContent);
                    const filesList: string[] = Array.isArray(metaData?.userData?.files) ? metaData.userData.files : [];
                    console.log('需要进行copy的filesList', filesList)
                    if (!filesList.length) {
                        return {
                            success: false,
                            error: `安装失败：组件 ${compName} 的 meta 未声明要安装的 files`,
                        };
                    }

                    // 检查冲突（仅针对列出的文件）
                    for (const fileRel of filesList) {
                        if (fileRel.endsWith('.meta')) continue;
                        const destPath = path.join(targetPath, fileRel);
                        try {
                            await fs.promises.access(destPath);
                            conflictFiles.push(fileRel);
                        } catch { }
                    }
                    if (conflictFiles.length > 0) {
                        console.log(`[xhgame_plugin] 检测到冲突文件: ${conflictFiles.join('\n')}`);
                        return {
                            success: false,
                            error: `安装失败：检测到以下文件已存在，请先删除或备份这些文件：\n${conflictFiles.join('\n')}`,
                        };
                    }

                    console.log(`[xhgame_plugin] 使用meta files列表进行复制，文件数量: ${filesList.length}`);

                    // 复制列出的文件
                    async function copySelectedFiles(files: string[]) {
                        for (const fileRel of files) {
                            const srcPath = path.join(assetsSourcePath, fileRel);
                            const destPath = path.join(targetPath, fileRel);
                            try {
                                const stat = await fs.promises.stat(srcPath);
                                if (stat.isDirectory()) {
                                    await fs.promises.mkdir(destPath, { recursive: true });
                                    await copyDirectory(srcPath, destPath, fileRel);
                                } else {
                                    await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
                                    await fs.promises.copyFile(srcPath, destPath);
                                    copiedFiles.push(fileRel);
                                    console.log(`[xhgame_plugin] 复制文件: ${fileRel}`);
                                }
                            } catch (e) {
                                missingFiles.push(fileRel);
                                console.warn(`[xhgame_plugin] 缺失文件（未在压缩包中找到）: ${fileRel}`);
                            }
                        }
                    }

                    await copySelectedFiles(filesList);

                    if (missingFiles.length > 0) {
                        return {
                            success: false,
                            error: `安装失败：以下声明的文件在压缩包中未找到：\n${missingFiles.join('\n')}`,
                        };
                    }
                } catch (err) {
                    return {
                        success: false,
                        error: `安装失败：读取组件meta失败或格式错误（${String(err)}）`,
                    };
                }
            } else {
                // 旧模式或无meta：复制整个源目录（保持兼容）
                await checkConflicts(assetsSourcePath, targetPath);
                if (conflictFiles.length > 0) {
                    console.log(`[xhgame_plugin] 检测到冲突文件: ${conflictFiles.join('\n')}`);
                    return {
                        success: false,
                        error: `安装失败：检测到以下文件已存在，请先删除或备份这些文件：\n${conflictFiles.join('\n')}`,
                    };
                }
                console.log(`[xhgame_plugin] 没有冲突文件，开始复制整个目录...`);
                await copyDirectory(assetsSourcePath, targetPath);
            }

            async function copyDirectory(srcDir: string, destDir: string, relativePath: string = '') {
                const items = await fs.promises.readdir(srcDir, { withFileTypes: true });

                for (const item of items) {
                    const srcPath = path.join(srcDir, item.name);
                    const destPath = path.join(destDir, item.name);
                    const relPath = path.join(relativePath, item.name);



                    if (item.isDirectory()) {
                        // 所有 .meta 文件夹可以跳过
                        if (item.name.endsWith('.meta')) {
                            continue;
                        }
                        // 创建目录
                        await fs.promises.mkdir(destPath, { recursive: true });
                        await copyDirectory(srcPath, destPath, relPath);
                    } else {
                        // 复制文件
                        await fs.promises.copyFile(srcPath, destPath);
                        copiedFiles.push(relPath);
                        console.log(`[xhgame_plugin] 复制文件: ${relPath}`);
                    }
                }
            }

            console.log(`[xhgame_plugin] 组件安装完成，共复制 ${copiedFiles.length} 个文件`);

            // 记录安装信息到配置文件 copiedFiles等到xhgame_plugin-installInfo.json中的 installedComponents
            try {
                const extensionPath = getExtensionsPath(pluginName);
                const installInfoPath = path.join(extensionPath, pluginName + '-installInfo.json');
                let installInfo: any = {
                    version: '1.0.0',
                    lastUpdated: new Date().toISOString(),
                    localComponents: {},
                    installedComponents: []
                };

                if (fs.existsSync(installInfoPath)) {
                    try {
                        const content = await fs.promises.readFile(installInfoPath, 'utf-8');
                        const parsed = JSON.parse(content);
                        installInfo = Object.assign(installInfo, parsed);
                    } catch (e) {
                        console.warn(`[xhgame_plugin] 读取安装信息失败，将创建新的安装信息文件`, e);
                    }
                }

                // 从 meta 中获取显示名与版本（若可用）
                let componentCode = compName;
                let componentId = compName;
                let componentDisplayName = compName;
                let componentVersion = '1.0.0';
                try {
                    const metaPath = zipFilePath + '.meta';
                    if (fs.existsSync(metaPath)) {
                        const metaContent = await fs.promises.readFile(metaPath, 'utf-8');
                        const metaData = JSON.parse(metaContent);
                        if (metaData?.userData) {
                            componentCode = metaData.userData.name || compName;
                            componentId = metaData.userData.name || compName;
                            componentDisplayName = metaData.userData.displayName || compName;
                            componentVersion = metaData.userData.version || componentVersion;
                        }
                    }
                } catch { }

                // 更新 localComponents
                installInfo.localComponents = installInfo.localComponents || {};
                installInfo.localComponents[componentCode] = {
                    status: 'installed',
                    installDate: new Date().toISOString(),
                    installPath: targetPath
                };

                // 更新 installedComponents 列表（去重后追加）
                installInfo.installedComponents = Array.isArray(installInfo.installedComponents) ? installInfo.installedComponents : [];
                installInfo.installedComponents = installInfo.installedComponents.filter((c: any) => c.componentCode !== componentCode);
                installInfo.installedComponents.push({
                    componentName: componentDisplayName,
                    componentId: componentId,
                    componentCode: componentCode,
                    version: componentVersion,
                    copiedFiles: copiedFiles,
                    installedAt: new Date().toISOString()
                });

                installInfo.lastUpdated = new Date().toISOString();

                await fs.promises.writeFile(installInfoPath, JSON.stringify(installInfo, null, 2), 'utf-8');
                console.log(`[xhgame_plugin] 安装信息已写入: ${installInfoPath}`);
            } catch (writeErr) {
                console.warn(`[xhgame_plugin] 写入安装信息失败，但组件安装已完成:`, writeErr);
            }

            // 记录安装信息到配置文件 copiedFiles等到xhgame_plugin-installInfo.json中的 installedComponents



            return {
                success: true,
                error: `组件 ${compName} 从内置资源安装成功！`,
                // copiedFiles: copiedFiles
            };

        } catch (error) {
            console.error(`[xhgame_plugin] 从内置资源安装组件失败: `, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        } finally {
            // 清理临时解压目录
            if (extractTempDir && fs.existsSync(extractTempDir)) {
                try {
                    await fs.promises.rm(extractTempDir, { recursive: true, force: true });
                    const parentExtractDir = path.join(getPackagesPath(pluginName), '__extract');
                    // 若父目录为空则清理
                    try {
                        const remain = await fs.promises.readdir(parentExtractDir);
                        if (remain.length === 0) {
                            await fs.promises.rm(parentExtractDir, { recursive: true, force: true });
                        }
                    } catch { }
                } catch (cleanupErr) {
                    console.warn(`[xhgame_plugin] 清理临时目录失败: ${extractTempDir}`, cleanupErr);
                }
            }
        }
    }
    static async uninstallComponent(param: any): Promise<IUninstallRes> {
        console.log('uninstallComponent', param)
        const { compName, pluginName } = param;
        if (!compName || !pluginName) {
            return {
                success: false,
                error: '组件名或插件名不能为空'
            };
        }

        console.log(`[xhgame_plugin] 安装卸载组件请求: ${compName}`, param);

        try {
            // 获取项目路径
            const projectPath = getProjectPath(pluginName)
            const assetsPath = path.join(projectPath, 'assets');

            const extensionPath = getExtensionsPath(pluginName);
            const installInfoPath = path.join(extensionPath, pluginName + '-installInfo.json');
            if (!fs.existsSync(installInfoPath)) {
                return {
                    success: false,
                    error: '未找到组件安装信息文件'
                };
            }
            // 读取以前的安装信息
            const installInfo = JSON.parse(await fs.promises.readFile(installInfoPath, 'utf-8'));
            const component = installInfo.installedComponents.find((c: { componentCode: any; }) => c.componentCode === compName);
            if (!component) {
                return {
                    success: false,
                    error: `未找到组件 ${compName} 的安装记录`
                };
            }

            // 备份和删除文件
            // const backedUpFiles: string[] = [];
            const deletedFiles: string[] = [];
            const notFoundFiles: string[] = [];

            for (const relativeFilePath of component.copiedFiles) {
                const fullFilePath = path.join(assetsPath, relativeFilePath);
                const metaFilePath = fullFilePath + '.meta';
                const relativeMetaFilePath = relativeFilePath + '.meta';

                try {
                    // 检查文件是否存在
                    await fs.promises.access(fullFilePath);
                    // 删除原文件
                    await fs.promises.unlink(fullFilePath);
                    deletedFiles.push(relativeFilePath);
                    console.log(`[xhgame_plugin] 删除文件: ${relativeFilePath}`);

                } catch (error) {
                    console.warn(`[xhgame_plugin] 文件不存在或处理失败: ${relativeFilePath}`, error);
                    notFoundFiles.push(relativeFilePath);
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
            try {
                const extensionPath = getExtensionsPath(pluginName);
                if (!extensionPath) {
                    throw new Error('无法获取插件路径');
                }
                // 检查备份信息文件是否存在
                const installInfoPath = path.join(extensionPath, pluginName + '-installInfo.json');

                // const installInfoPath = path.join(getProjectPath('xhgame_plugin'), '..', 'xhgame_plugin-installInfo.json');
                let installInfo: any = {};

                // 读取现有的安装信息
                if (await fs.promises.access(installInfoPath).then(() => true).catch(() => false)) {
                    const installInfoContent = await fs.promises.readFile(installInfoPath, 'utf-8');
                    installInfo = JSON.parse(installInfoContent);
                }

                // 从 localComponents 中移除组件记录
                if (installInfo.localComponents && installInfo.localComponents[compName]) {
                    delete installInfo.localComponents[compName];
                    console.log(`[xhgame_plugin] 已从 localComponents 中移除组件: ${compName}`);
                }

                // 从 installedComponents 中移除组件记录
                if (installInfo.installedComponents && Array.isArray(installInfo.installedComponents)) {
                    const originalLength = installInfo.installedComponents.length;
                    installInfo.installedComponents = installInfo.installedComponents.filter(
                        (comp: any) => comp.componentCode !== compName
                    );
                    if (installInfo.installedComponents.length < originalLength) {
                        console.log(`[xhgame_plugin] 已从 installedComponents 中移除组件: ${compName}`);
                    }
                }

                // 更新 lastUpdated 时间戳
                installInfo.lastUpdated = new Date().toISOString();

                // 写回文件
                await fs.promises.writeFile(installInfoPath, JSON.stringify(installInfo, null, 2), 'utf-8');
                console.log(`[xhgame_plugin] 组件记录已从安装信息中移除: ${compName}`);

            } catch (error) {
                console.warn(`[xhgame_plugin] 移除组件记录失败:`, error);
                // 不影响卸载结果，只是记录移除失败
            }

            console.log(`[xhgame_plugin] 组件卸载完成: ${component.componentName}`);

            return {
                success: true,
                // error: `组件 ${component.componentName} 卸载成功！\n备份位置: ${backupFolderName}`,
                // backupPath: componentBackupDir,
                // backedUpFiles: backedUpFiles,
                // deletedFiles: deletedFiles,
                // notFoundFiles: notFoundFiles
            };

        } catch (error) {
            console.error(`[xhgame_plugin] 卸载组件失败: `, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    static async checkInstallExists(param: any): Promise<IInstallInfoRes> {
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
}