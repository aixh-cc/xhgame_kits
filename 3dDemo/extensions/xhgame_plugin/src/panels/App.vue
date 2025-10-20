<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted } from 'vue';

import { ElMessage } from 'element-plus';

import { name } from '../../package.json';

import HelloWorld from './components/HelloWorld.vue';
import CompList from './components/CompList.vue';
import { state } from './pina';
import { keyAppRoot, keyMessage } from './provide-inject';
import cocosEditorBridge from './cocos-bridge';

const appRootDom = inject(keyAppRoot);
const message = inject(keyMessage)!;

// 当前激活的标签页
const activeTab = ref('components');

// Cocos 编辑器连接状态
const editorConnected = ref(false);

const open = () => {
    ElMessage({
        message: 'show message',
        appendTo: appRootDom,
    });
};

function open2() {
    message({ message: 'show inject message' });
}

async function showVersion() {
    try {
        const version = await cocosEditorBridge.getVersion();
        message({ message: `编辑器版本: ${version}` });
    } catch (error) {
        message({ message: '获取版本失败: ' + error, type: 'error' });
    }
}

// 测试编辑器通信功能
async function testEditorCommunication() {
    try {
        // 测试获取场景信息
        const sceneInfo = await cocosEditorBridge.requestMessage('scene', 'get-scene-info');
        message({ 
            message: `场景信息: ${JSON.stringify(sceneInfo)}`, 
            type: 'success',
            duration: 5000
        });
    } catch (error) {
        message({ message: '编辑器通信测试失败: ' + error, type: 'error' });
    }
}

// 模拟资源变化事件
function simulateAssetChange() {
    if ((window as any).__COCOS_BRIDGE_DEV__) {
        (window as any).__COCOS_BRIDGE_DEV__.simulateAssetChange();
        message({ message: '已触发资源变化事件', type: 'info' });
    }
}

// 模拟节点选择事件
function simulateNodeSelection() {
    if ((window as any).__COCOS_BRIDGE_DEV__) {
        (window as any).__COCOS_BRIDGE_DEV__.simulateNodeSelection('TestNode');
        message({ message: '已触发节点选择事件', type: 'info' });
    }
}

// 事件监听器
const onAssetChange = (event: any) => {
    message({ 
        message: `资源变化: ${event.path}`, 
        type: 'info',
        duration: 3000
    });
};

const onNodeChanged = (event: any) => {
    message({ 
        message: `节点变化: ${event.name}`, 
        type: 'info',
        duration: 3000
    });
};

onMounted(() => {
    // 监听编辑器事件
    cocosEditorBridge.on('asset-change', onAssetChange);
    cocosEditorBridge.on('node-changed', onNodeChanged);
    
    // 检查编辑器连接状态
    editorConnected.value = !(import.meta.env.DEV && !(window as any).Editor);
    
    message({ 
        message: editorConnected.value ? '已连接到 Cocos Creator 编辑器' : '开发模式 - 使用模拟编辑器环境',
        type: editorConnected.value ? 'success' : 'warning'
    });
});

onUnmounted(() => {
    // 清理事件监听器
    cocosEditorBridge.off('asset-change', onAssetChange);
    cocosEditorBridge.off('node-changed', onNodeChanged);
});
</script>

<template>
    <div class="container">
        <div class="header">
            <div class="logos">
                <a href="https://vitejs.dev" target="_blank">
                    <img src="./assets/vite.svg" class="logo" alt="Vite logo" />
                </a>
                <a href="https://vuejs.org/" target="_blank">
                    <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
                </a>
                <a href="https://www.cocos.com/" target="_blank">
                    <img src="./assets/cocos.png" class="logo cocos" alt="Cocos logo" />
                </a>
                <a href="https://element-plus.org/zh-CN/" target="_blank">
                    <img src="./assets/element-plus-logo.svg" class="logo element" alt="element-plus logo" />
                </a>
            </div>
            
            <div class="actions">
                <el-button type="primary" @click="open">show message</el-button>
                <el-button type="danger" @click="open2">show inject message</el-button>
                <el-button type="default" @click="showVersion">get creator version</el-button>
                <el-button type="success" @click="testEditorCommunication">测试编辑器通信</el-button>
                <el-button type="warning" @click="simulateAssetChange" v-if="!editorConnected">模拟资源变化</el-button>
                <el-button type="info" @click="simulateNodeSelection" v-if="!editorConnected">模拟节点选择</el-button>
            </div>
            
            <div class="status-bar">
                <el-tag :type="editorConnected ? 'success' : 'warning'">
                    {{ editorConnected ? '已连接编辑器' : '开发模式' }}
                </el-tag>
            </div>
        </div>
        
        <el-tabs v-model="activeTab" class="main-tabs">
            <el-tab-pane label="组件库" name="components">
                <CompList />
            </el-tab-pane>
            <el-tab-pane label="示例" name="examples">
                <HelloWorld msg="Vite + Vue + Cocos Creator + element-plus" />
                <p>Try to click the menu: [ panel/{{ name }}/send to panel ] {{ state.a }}</p>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.header {
    padding: 10px 20px;
    border-bottom: 1px solid #eee;
}

.logos {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.logo {
    height: 3em;
    padding: 0.5em;
    will-change: filter;
    transition: filter 300ms;
}

.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}

.actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.status-bar {
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.main-tabs {
    flex: 1;
    overflow: auto;
    padding: 0 20px;
}
</style>
