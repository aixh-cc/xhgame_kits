import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// 复制文件
router.post('/copy', async (req: express.Request, res: express.Response) => {
    try {
        const { source, destination } = req.body;
        
        if (!source || !destination) {
            return res.status(400).json({ 
                error: 'Source and destination paths are required' 
            });
        }

        // 确保目标目录存在
        const destDir = path.dirname(destination);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        // 复制文件
        fs.copyFileSync(source, destination);

        res.json({ 
            success: true,
            message: 'File copied successfully',
            source,
            destination 
        });
    } catch (error) {
        console.error('Error copying file:', error);
        res.status(500).json({ 
            error: 'Failed to copy file',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});

// 移动文件
router.post('/move', async (req: express.Request, res: express.Response) => {
    try {
        const { source, destination } = req.body;
        
        if (!source || !destination) {
            return res.status(400).json({ 
                error: 'Source and destination paths are required' 
            });
        }

        // 确保目标目录存在
        const destDir = path.dirname(destination);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        // 移动文件
        fs.renameSync(source, destination);

        res.json({ 
            success: true,
            message: 'File moved successfully',
            source,
            destination 
        });
    } catch (error) {
        console.error('Error moving file:', error);
        res.status(500).json({ 
            error: 'Failed to move file',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});

// 删除文件
router.delete('/delete', async (req: express.Request, res: express.Response) => {
    try {
        const { filePath } = req.body;
        
        if (!filePath) {
            return res.status(400).json({ 
                error: 'File path is required' 
            });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                error: 'File not found',
                filePath 
            });
        }

        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
        } else {
            fs.unlinkSync(filePath);
        }

        res.json({ 
            success: true,
            message: 'File deleted successfully',
            filePath 
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ 
            error: 'Failed to delete file',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});

// 读取文件内容
router.get('/read', async (req: express.Request, res: express.Response) => {
    try {
        const { filePath } = req.query;
        
        if (!filePath || typeof filePath !== 'string') {
            return res.status(400).json({ 
                error: 'File path is required' 
            });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                error: 'File not found',
                filePath 
            });
        }

        const content = fs.readFileSync(filePath, 'utf-8');

        res.json({ 
            success: true,
            content,
            filePath 
        });
    } catch (error) {
        console.error('Error reading file:', error);
        res.status(500).json({ 
            error: 'Failed to read file',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});

// 写入文件内容
router.post('/write', async (req: express.Request, res: express.Response) => {
    try {
        const { filePath, content } = req.body;
        
        if (!filePath || content === undefined) {
            return res.status(400).json({ 
                error: 'File path and content are required' 
            });
        }

        // 确保目录存在
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, content, 'utf-8');

        res.json({ 
            success: true,
            message: 'File written successfully',
            filePath 
        });
    } catch (error) {
        console.error('Error writing file:', error);
        res.status(500).json({ 
            error: 'Failed to write file',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});

export { router as fileRoutes };