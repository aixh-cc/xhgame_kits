import { createApp } from 'vue';
import './panels/style.css';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import { ElMessage } from 'element-plus';

import App from './panels/App.vue';
import { state } from './panels/pina';
import { keyAppRoot, keyMessage } from './panels/provide-inject';
import cocosEditorBridge from './panels/cocos-bridge';

import type { MessageOptions } from 'element-plus';

// 模拟 Cocos Creator 编辑器环境
(window as any).Editor = {
    Message: {
        async request(name: string, method: string, ...args: any[]) {
            console.log(`[Mock Editor] Request: ${name}.${method}`, args);
            
            // 模拟不同的方法响应
            switch (method) {
                case 'get-version':
                    return 'Cocos Creator 3.8.6 (Development Mode)';
                case 'open':
                    console.log('[Mock Editor] Opening panel...');
                    return true;
                case 'increase':
                    state.a += 1;
                    console.log('[Mock Editor] State increased:', state.a);
                    return state.a;
                default:
                    return `Mock response for ${method}`;
            }
        },
        
        send(name: string, method: string, ...args: any[]) {
            console.log(`[Mock Editor] Send: ${name}.${method}`, args);
        }
    },
    
    Panel: {
        define(config: any) {
            console.log('[Mock Editor] Panel defined:', config);
            return config;
        }
    }
};

// 创建 Vue 应用
const app = createApp(App);

// 获取根元素
const rootElement = document.getElementById('app')!;

// 添加 dark 类名以支持暗色主题
rootElement.className = 'dark';

// 提供依赖注入
app.provide(keyAppRoot, rootElement);
app.provide(keyMessage, (options: MessageOptions = {}) => {
    if (typeof options === 'string') {
        options = { message: options };
    }
    options.appendTo ??= rootElement;
    return ElMessage(options);
});

// 挂载应用
app.mount(rootElement);

// 开发模式下的额外功能
if (import.meta.env.DEV) {
    console.log('🚀 XHGame Plugin running in development mode');
    console.log('📡 Mock Cocos Creator Editor environment loaded');
    
    // 添加全局调试工具
    (window as any).__XHGAME_DEBUG__ = {
        state,
        app,
        bridge: cocosEditorBridge,
        increaseState: () => {
            state.a += 1;
            console.log('State increased to:', state.a);
        },
        resetState: () => {
            state.a = 0;
            console.log('State reset to:', state.a);
        },
        testBridge: async () => {
            console.log('Testing Cocos Editor Bridge...');
            try {
                const version = await cocosEditorBridge.getVersion();
                console.log('Version:', version);
                
                const sceneInfo = await cocosEditorBridge.requestMessage('scene', 'get-scene-info');
                console.log('Scene Info:', sceneInfo);
                
                return { success: true, version, sceneInfo };
            } catch (error) {
                console.error('Bridge test failed:', error);
                return { success: false, error };
            }
        }
    };
    
    console.log('🛠️ Debug tools available at window.__XHGAME_DEBUG__');
    console.log('🌉 Cocos Editor Bridge available at window.__XHGAME_DEBUG__.bridge');
    console.log('🧪 Test bridge with: window.__XHGAME_DEBUG__.testBridge()');
}