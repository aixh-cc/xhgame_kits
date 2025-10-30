import express from 'express';
import fs from 'fs';
import path from 'path';
import yauzl from 'yauzl';
import archiver from 'archiver';
import { getPackagesPath, Util } from '../../common/Util';
import { IPackageInfoWithStatus } from '../../common/defined';

const router = express.Router();


// 获取所有包列表
router.get('/', async (req, res) => {
    try {
        const packagesPath = getPackagesPath('xhgame_plugin');

        if (!fs.existsSync(packagesPath)) {
            console.error('Packages directory not found' + packagesPath)
            return res.status(404).json({
                error: 'Packages directory not found',
                path: packagesPath
            });
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

                let packageInfoWithStatus: IPackageInfoWithStatus | null = null

                // 尝试从 .meta 文件读取包信息
                if (fs.existsSync(metaPath)) {
                    try {
                        const metaContent = fs.readFileSync(metaPath, 'utf-8');
                        const metaData = JSON.parse(metaContent);
                        if (metaData.userData && typeof metaData.userData === 'object') {
                            packageInfoWithStatus = {
                                ...metaData.userData,
                            };
                            if (packageInfoWithStatus) {
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
                            }
                        }
                    } catch (error) {
                        console.error(`Error reading meta for ${item}:`, error);
                    }
                }
                packages.push(packageInfoWithStatus);
            }
        }
        console.log('接口返回', {
            success: true,
            packagesPath,
            packages
        })
        res.json({
            success: true,
            packagesPath,
            packages
        });
    } catch (error) {
        console.error('Error getting packages:', error);
        res.status(500).json({
            error: 'Failed to get packages',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});

// 获取特定包的详细信息
router.get('/:packageName', async (req, res) => {
    try {
        const { packageName } = req.params;
        const packagesPath = getPackagesPath('xhgame_plugin');

        // 尝试查找 .zip 文件或目录
        let packagePath = path.join(packagesPath, packageName);
        let zipPath = path.join(packagesPath, `${packageName}.zip`);

        let isZip = false;
        let targetPath = '';

        if (fs.existsSync(zipPath)) {
            targetPath = zipPath;
            isZip = true;
        } else if (fs.existsSync(packagePath)) {
            targetPath = packagePath;
            isZip = false;
        } else {
            return res.status(404).json({
                error: 'Package not found',
                packageName
            });
        }

        const stats = fs.statSync(targetPath);
        let packageInfo: any = {
            name: packageName,
            path: targetPath,
            type: isZip ? 'zip' : 'directory',
            size: stats.size
        };

        if (isZip) {
            // 处理 .zip 包
            const metaPath = targetPath + '.meta';
            if (fs.existsSync(metaPath)) {
                try {
                    const metaContent = fs.readFileSync(metaPath, 'utf-8');
                    const metaData = JSON.parse(metaContent);

                    if (metaData.userData && typeof metaData.userData === 'object') {
                        packageInfo = { ...packageInfo, ...metaData.userData };
                    }
                } catch (error) {
                    console.error(`Error reading meta for ${packageName}:`, error);
                }
            }
        } else {
            // 处理目录包
            const configPath = path.join(targetPath, `${packageName}.json`);
            if (fs.existsSync(configPath)) {
                try {
                    const configContent = fs.readFileSync(configPath, 'utf-8');
                    const config = JSON.parse(configContent);
                    packageInfo = { ...packageInfo, ...config };
                } catch (error) {
                    console.error(`Error reading config for ${packageName}:`, error);
                }
            }

            // 列出目录内容
            const files = fs.readdirSync(targetPath);
            packageInfo.files = files.map(file => {
                const filePath = path.join(targetPath, file);
                const fileStats = fs.statSync(filePath);
                return {
                    name: file,
                    type: fileStats.isDirectory() ? 'directory' : 'file',
                    size: fileStats.size,
                    modified: fileStats.mtime
                };
            });
        }

        res.json({
            success: true,
            package: packageInfo
        });
    } catch (error) {
        console.error('Error getting package details:', error);
        res.status(500).json({
            error: 'Failed to get package details',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});

// 解压 ZIP 包
router.post('/:packageName/extract', async (req, res) => {
    try {
        const { packageName } = req.params;
        const packagesPath = getPackagesPath('xhgame_plugin');
        const zipPath = path.join(packagesPath, `${packageName}.zip`);

        if (!fs.existsSync(zipPath)) {
            return res.status(404).json({
                error: 'ZIP file not found',
                packageName
            });
        }

        const extractPath = path.join(packagesPath, packageName);

        // 创建解压目录
        if (!fs.existsSync(extractPath)) {
            fs.mkdirSync(extractPath, { recursive: true });
        }

        // 解压文件
        yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
            if (err) {
                return res.status(500).json({
                    error: 'Failed to open ZIP file',
                    message: err.message
                });
            }

            zipfile.readEntry();
            zipfile.on('entry', (entry) => {
                if (/\/$/.test(entry.fileName)) {
                    // 目录
                    const dirPath = path.join(extractPath, entry.fileName);
                    fs.mkdirSync(dirPath, { recursive: true });
                    zipfile.readEntry();
                } else {
                    // 文件
                    zipfile.openReadStream(entry, (err, readStream) => {
                        if (err) throw err;

                        const filePath = path.join(extractPath, entry.fileName);
                        const dirPath = path.dirname(filePath);

                        if (!fs.existsSync(dirPath)) {
                            fs.mkdirSync(dirPath, { recursive: true });
                        }

                        const writeStream = fs.createWriteStream(filePath);
                        readStream.pipe(writeStream);

                        writeStream.on('close', () => {
                            zipfile.readEntry();
                        });
                    });
                }
            });

            zipfile.on('end', () => {
                res.json({
                    success: true,
                    message: 'Package extracted successfully',
                    extractPath
                });
            });
        });

    } catch (error) {
        console.error('Error extracting package:', error);
        res.status(500).json({
            error: 'Failed to extract package',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});

export { router as packageRoutes };