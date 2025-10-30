# XHGame Node.js Service

这是一个为 XHGame 插件提供 Node.js 后端服务的插件，主要用于文件操作和包管理功能。

## 功能特性

- 📦 包管理：读取、解压、管理 packages 目录下的组件包
- 📁 文件操作：复制、移动、删除、读取、写入文件
- 🌐 HTTP API：提供 RESTful API 接口
- 🔄 CORS 支持：允许前端应用跨域访问

## 安装和启动

1. 安装依赖：
```bash
cd extensions/xhgame_nodejs_service
npm install
```

2. 开发模式启动：
```bash
npm run dev
```

3. 生产模式：
```bash
npm run build
npm start
```

服务将在 `http://localhost:3001` 启动。

## API 接口

### 包管理 API

#### 获取所有包列表
```
GET /api/packages
```

#### 获取特定包详情
```
GET /api/packages/:packageName
```

#### 解压 ZIP 包
```
POST /api/packages/:packageName/extract
```

### 文件操作 API

#### 复制文件
```
POST /api/files/copy
Body: { "source": "源文件路径", "destination": "目标文件路径" }
```

#### 移动文件
```
POST /api/files/move
Body: { "source": "源文件路径", "destination": "目标文件路径" }
```

#### 删除文件
```
DELETE /api/files/delete
Body: { "filePath": "文件路径" }
```

#### 读取文件
```
GET /api/files/read?filePath=文件路径
```

#### 写入文件
```
POST /api/files/write
Body: { "filePath": "文件路径", "content": "文件内容" }
```

### 健康检查
```
GET /health
```

## 在前端中使用

在 `xhgame_plugin` 的前端代码中，可以这样调用后端服务：

```javascript
// 获取包列表
const response = await fetch('http://localhost:3001/api/packages');
const data = await response.json();

// 解压包
const extractResponse = await fetch('http://localhost:3001/api/packages/MyComponent.zip/extract', {
    method: 'POST'
});

// 复制文件
const copyResponse = await fetch('http://localhost:3001/api/files/copy', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        source: '/path/to/source/file',
        destination: '/path/to/destination/file'
    })
});
```

## 目录结构

```
xhgame_nodejs_service/
├── src/
│   ├── main.ts              # 主服务器文件
│   └── routes/
│       ├── packages.ts      # 包管理路由
│       └── files.ts         # 文件操作路由
├── dist/                    # 编译输出目录
├── package.json
├── tsconfig.json
└── README.md
```

## 注意事项

1. 确保 Node.js 版本 >= 16
2. 服务默认运行在 3001 端口，可通过环境变量 `PORT` 修改
3. 服务会自动查找项目根目录下的 `assets/packages` 目录
4. 所有文件操作都有安全检查，但请谨慎使用删除功能