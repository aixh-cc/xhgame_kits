import { name } from '../../package.json' with { type: 'json' };

export const methods = {
    async open() {
        Editor.Panel.open(name);
    },
    getVersion() {
        return Editor.App.version;
    },
    // 下载组件的消息处理器
    async 'download-component'(info: any) {
        const { url, targetPath, name: componentName } = info;
        
        console.log(`[xhgame_plugin] 下载组件请求: ${componentName}, URL: ${url}, 目标路径: ${targetPath}`);
        
        try {
            // 这里应该实现实际的下载和解压逻辑
            // 1. 下载文件到临时目录
            // 2. 解压文件到目标路径
            // 3. 返回成功或失败信息
            
            // 模拟下载过程
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 返回成功信息
            return {
                success: true,
                message: `组件 ${componentName} 已成功安装到 ${targetPath}`
            };
        } catch (error) {
            console.error(`[xhgame_plugin] 下载组件失败:`, error);
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
