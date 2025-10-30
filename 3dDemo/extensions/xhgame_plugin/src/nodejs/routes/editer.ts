import express from 'express';
import fs from 'fs';
import path from 'path';
import yauzl from 'yauzl';
import archiver from 'archiver';
import { Util } from '../Util';


const router = express.Router();

// 获取项目根目录下的 packages 路径
export const getPackagesPath = (pluginName: string) => {
    // 从当前插件目录向上找到项目根目录
    const currentDir = process.cwd();
    const extensionsRoot = path.resolve(currentDir, '../');
    return path.join(extensionsRoot, pluginName, 'assets', 'packages');
};

// 获取所有包列表
router.get('/', async (req, res) => {
    try {
        res.json({
            success: true,
            version: '3.9.9'
        });
    } catch (error) {
        console.error('Error getting packages:', error);
        res.status(500).json({
            error: 'Failed to get packages',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});

export { router as editerRoutes };