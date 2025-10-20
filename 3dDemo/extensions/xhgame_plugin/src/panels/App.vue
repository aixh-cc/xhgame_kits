<script setup lang="ts">
import { inject, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { name } from '../../package.json';

import HelloWorld from './components/HelloWorld.vue';
import CompList from './components/CompList.vue';
import { state } from './pina';
import { keyAppRoot, keyMessage } from './provide-inject';

const appRootDom = inject(keyAppRoot);
const message = inject(keyMessage)!;

// 当前激活的标签页
const activeTab = ref('components');

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
    const version = await Editor.Message.request(name, 'get-version');
    message({ message: version });
}
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
}

.main-tabs {
    flex: 1;
    overflow: auto;
    padding: 0 20px;
}
</style>
