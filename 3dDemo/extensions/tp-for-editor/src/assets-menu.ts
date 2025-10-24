import { spawn } from "child_process";
import { copyFileSync, existsSync, rmSync, mkdirSync } from 'fs';
import { AssetInfo } from "../@types/packages/asset-db/@types/public";
import { join, basename, dirname } from "path";
import { tmpdir } from "os";

// 解包命令
var unpacker_command = ''
if (process.platform === "win32") {
    unpacker_command = join(__dirname, "./tools/texture-unpacker.exe");
} else {
    unpacker_command = join(__dirname, "./tools/unpacker");
}

var packer_command = ''
if (process.platform === "win32") {
    packer_command = join(__dirname, "./tools/texturepacker.exe")
} else {
    packer_command = '/usr/local/bin/TexturePacker';
}

export function onAssetMenu(assetInfo: AssetInfo) {
    const isSpriteAtlas = assetInfo.importer === "sprite-atlas";
    const isFolder = assetInfo.isDirectory === true;
    const isSpriteInAtlas = (assetInfo.importer === "sprite-frame") && (assetInfo.url.includes(".plist/"));

    // 创建唯一临时目录（增强版）
    const createTempDir = () => {
        try {
            // 1. 获取系统临时目录
            const systemTempDir = tmpdir();
            console.log('[DEBUG] 系统临时目录:', systemTempDir);

            // 2. 验证临时目录是否存在
            if (!existsSync(systemTempDir)) {
                throw new Error(`系统临时目录不存在: ${systemTempDir}`);
            }

            // 3. 创建唯一子目录
            const tempDir = join(systemTempDir, `cocos-tp-tool-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);
            console.log('[DEBUG] 尝试创建临时目录:', tempDir);

            // 4. 带异常捕获的创建操作
            mkdirSync(tempDir, {
                recursive: true,
                mode: 0o755 // 显式设置目录权限（适用于Linux/Mac）
            });

            // 5. 二次验证目录是否创建成功
            if (!existsSync(tempDir)) {
                throw new Error(`目录创建后验证失败: ${tempDir}`);
            }

            console.log('[SUCCESS] 临时目录创建成功:', tempDir);
            return tempDir;
        } catch (error) {
            console.error('[ERROR] 创建临时目录失败:', error);
            throw new Error(`无法创建临时目录，请检查：
1. 磁盘是否已满
2. 是否有写权限（尝试手动创建目录验证）
3. 防病毒软件是否阻止操作
4. 系统临时目录是否有效`);
        }
    };

    // 安全清理临时目录
    const cleanupTempDir = (path: string) => {
        try {
            rmSync(path, {
                recursive: true,
                force: true,
                maxRetries: 3,
                retryDelay: 300
            });
        } catch (e) {
            console.error(`清理临时目录失败: ${path}`, e);
        }
    };

    return [
        {
            label: '【tp-tool】 新建合图',
            enabled: isFolder,
            click() {
                // console.log("assetInfo", assetInfo);
                let destPath = assetInfo.file;
                let destPlistFile = join(destPath, "TexturePacker.plist");
                let destPngFile = join(destPath, "TexturePacker.png");
                if (existsSync(destPlistFile)) {
                    console.error("新建合图失败，plist文件已存在", destPlistFile);
                    return;
                }
                if (existsSync(destPngFile)) {
                    console.error("新建合图失败，png文件已存在", destPngFile);
                    return;
                }

                copyFileSync(join(__dirname, "tools/TexturePacker.plist"), destPlistFile);
                copyFileSync(join(__dirname, "tools/TexturePacker.png"), destPngFile);
                // 刷新资源
                Editor.Message.request('asset-db', 'refresh-asset', destPlistFile);
                Editor.Message.request('asset-db', 'refresh-asset', destPngFile);
            }
        },
        {
            label: '【tp-tool】 添加到合图',
            enabled: isSpriteAtlas,
            click() {
                Editor.Dialog.select({
                    multi: true,
                    filters: [{ name: 'Images', extensions: ['png', 'jpg'] }]
                }).then(async (result) => {
                    if (result.filePaths.length === 0) return;

                    const tempDir = createTempDir();
                    try {
                        const plistFile = assetInfo.file;
                        const plistBase = plistFile.replace(/\.plist$/, "");
                        const filename = basename(plistFile)
                        const filenameWithouExt = filename.replace(/\.plist$/, "");
                        console.log('plistFile', plistFile)
                        console.log('plistBase', plistBase)
                        console.log('filename', filename)
                        console.log('filenameWithouExt', filenameWithouExt)
                        // 步骤1: 解包现有合图
                        const unpackProcess = spawn(
                            unpacker_command,
                            [plistBase, "plist", tempDir]
                        );

                        console.log('命令', [plistBase, "plist", tempDir].join(' '))

                        await new Promise((resolve, reject) => {
                            unpackProcess.on('close', resolve);
                            unpackProcess.on('error', reject);
                        });

                        // 步骤2: 添加新图片
                        console.log('添加新图片到')
                        for (const imgPath of result.filePaths) {
                            copyFileSync(imgPath, join(tempDir, basename(imgPath)));
                        }

                        // 步骤3: 重新打包
                        const packProcess = spawn(
                            packer_command,
                            [
                                tempDir,
                                "--max-size", "2048",
                                "--padding", "2",
                                "--sheet", `${tempDir}/${filenameWithouExt}.png`,
                                "--data", `${tempDir}/${filenameWithouExt}.plist`
                            ]
                        );


                        await new Promise((resolve, reject) => {
                            packProcess.on('close', resolve);
                            packProcess.on('error', reject);
                        });

                        // 验证输出文件
                        const outputPlist = join(tempDir, `${filenameWithouExt}.plist`);
                        const outputPng = join(tempDir, `${filenameWithouExt}.png`);
                        if (!existsSync(outputPlist)) {
                            throw new Error("缺少生成的plist文件,outputPlist=" + outputPlist)
                        };
                        if (!existsSync(outputPng)) {
                            throw new Error("缺少生成的png文件,outputPng=" + outputPng);
                        }
                        // 更新项目文件
                        copyFileSync(outputPlist, plistFile);
                        copyFileSync(outputPng, `${plistBase}.png`);

                        // 刷新资源
                        Editor.Message.request('asset-db', 'refresh-asset', assetInfo.url);
                        Editor.Message.request('asset-db', 'refresh-asset', assetInfo.url.replace(/\.plist$/, ".png"));
                    } catch (error) {
                        console.error("合图操作失败:", error);
                    } finally {
                        cleanupTempDir(tempDir);
                    }
                }).catch(console.error);
            }
        },

        {
            label: '【tp-tool】 从合图中删除',
            enabled: isSpriteInAtlas,
            async click() {
                const tempDir = createTempDir();
                try {
                    const plistFile = join(
                        Editor.Project.path,
                        assetInfo.url.replace("db://", "").split(".plist/")[0] + ".plist"
                    );
                    const plistBase = plistFile.replace(/\.plist$/, "");
                    const filename = basename(plistFile)
                    const filenameWithouExt = filename.replace(/\.plist$/, "");
                    // 解包现有合图
                    const unpackProcess = spawn(
                        unpacker_command,
                        [plistBase, "plist", tempDir]
                    );

                    await new Promise((resolve, reject) => {
                        unpackProcess.on('close', resolve);
                        unpackProcess.on('error', reject);
                    });

                    // 删除选中资源
                    const selected = await Promise.all(
                        Editor.Selection.getSelected(Editor.Selection.getLastSelectedType()).map(uuid =>
                            Editor.Message.request('asset-db', 'query-asset-info', uuid)
                        )
                    );

                    for (const asset of selected) {
                        if (!asset) continue;
                        const imgPath = join(
                            tempDir,
                            asset.url.split(".plist/")[1] + ".png"
                        );
                        if (existsSync(imgPath)) rmSync(imgPath);
                    }

                    // 重新打包
                    const packProcess = spawn(
                        packer_command,
                        [
                            tempDir,
                            "--max-size", "2048",
                            "--padding", "2",
                            "--sheet", `${tempDir}/${filenameWithouExt}.png`,
                            "--data", `${tempDir}/${filenameWithouExt}.plist`
                        ]
                    );

                    await new Promise((resolve, reject) => {
                        packProcess.on('close', resolve);
                        packProcess.on('error', reject);
                    });

                    // 验证输出文件
                    const outputPlist = join(tempDir, `${filenameWithouExt}.plist`);
                    const outputPng = join(tempDir, `${filenameWithouExt}.png`);
                    if (!existsSync(outputPlist)) {
                        throw new Error("缺少生成的plist文件,outputPlist=" + outputPlist)
                    };
                    if (!existsSync(outputPng)) {
                        throw new Error("缺少生成的png文件,outputPng=" + outputPng);
                    }
                    // 更新项目文件
                    copyFileSync(outputPlist, plistFile);
                    copyFileSync(outputPng, `${plistBase}.png`);

                    // 刷新资源
                    Editor.Message.request('asset-db', 'refresh-asset', plistFile);
                    Editor.Message.request('asset-db', 'refresh-asset', `${plistBase}.png`);
                } catch (error) {
                    console.error("删除操作失败:", error);
                } finally {
                    cleanupTempDir(tempDir);
                }
            }
        },

        {
            label: '【tp-tool】 另存为',
            enabled: isSpriteInAtlas,
            async click() {
                const tempDir = createTempDir();
                try {
                    const plistPath = join(
                        Editor.Project.path,
                        assetInfo.url.replace("db://", "").split(".plist/")[0] + ".plist"
                    );
                    const plistBase = plistPath.replace(/\.plist$/, "");

                    // 解包资源
                    const unpackProcess = spawn(
                        unpacker_command,
                        [plistBase, "plist", tempDir]
                    );

                    await new Promise((resolve, reject) => {
                        unpackProcess.on('close', resolve);
                        unpackProcess.on('error', reject);
                    });

                    // 选择保存目录
                    const result = await Editor.Dialog.select({
                        title: "另存为",
                        type: "directory",
                        path: dirname(Editor.Project.path)
                    });

                    if (!result.filePaths[0]) return;
                    const savePath = result.filePaths[0];

                    // 复制选中资源
                    const selected = await Promise.all(
                        Editor.Selection.getSelected(Editor.Selection.getLastSelectedType()).map(uuid =>
                            Editor.Message.request('asset-db', 'query-asset-info', uuid)
                        )
                    );

                    for (const asset of selected) {
                        if (!asset) continue;
                        const srcPath = join(
                            tempDir,
                            asset.url.split(".plist/")[1] + ".png"
                        );
                        const destPath = join(savePath, basename(srcPath));

                        mkdirSync(dirname(destPath), { recursive: true });
                        copyFileSync(srcPath, destPath);
                    }

                    // 打开资源管理器
                    const openCommand = process.platform === "win32"
                        ? "explorer"
                        : process.platform === "darwin"
                            ? "open"
                            : "xdg-open";
                    spawn(openCommand, [savePath]);
                } catch (error) {
                    console.error("另存为操作失败:", error);
                } finally {
                    cleanupTempDir(tempDir);
                }
            }
        }
    ];
};