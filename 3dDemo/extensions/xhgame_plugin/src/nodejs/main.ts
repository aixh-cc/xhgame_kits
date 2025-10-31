import express from 'express';
import cors from 'cors';
import path from 'path';
import { packageRoutes } from './routes/packages';
import { fileRoutes } from './routes/files';
import { editerRoutes } from './routes/editer';
import { version } from 'os';
import { Util } from '../common/Util';
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// 路由
app.use('/api/files', fileRoutes);

// 获取版本
app.post('/api/get-version', async (req, res) => {
    res.json(await Util.getVersion(req.body.pluginName));
});
// 获取组件列表
app.post('/api/get-packages', async (req, res) => {
    res.json(await Util.getPackages(req.body.pluginName));
});
// 安装组件
app.post('/api/install-from-assets', async (req, res) => {
    res.json(await Util.installFromAssets(req.body));
});
// 卸载组件
app.post('/api/uninstall-component', async (req, res) => {
    res.json(await Util.uninstallComponent(req.body));
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'xhgame_nodejs_service'
    });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 XHGame Node.js Service running on http://localhost:${PORT}`);
    console.log(`📁 Working directory: ${process.cwd()}`);
    console.log(`📦 Packages directory: ${path.resolve('../../packages')}`);
});

export default app;