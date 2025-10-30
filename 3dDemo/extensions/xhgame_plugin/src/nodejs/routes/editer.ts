import express from 'express';
import fs from 'fs';
import path from 'path';
import yauzl from 'yauzl';
import archiver from 'archiver';
import { Util } from '../../common/Util';


const router = express.Router();


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