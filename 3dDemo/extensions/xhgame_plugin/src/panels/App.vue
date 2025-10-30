<script setup lang="ts">
import { inject, ref } from 'vue';
import { name } from '../../package.json';
import CompList from './components/CompList.vue';
import HelloWorld from './components/HelloWorld.vue';
import { keyMessage } from './provide-inject';
import cocosEditorBridge from './cocos-bridge';
import { IGetVersionRes } from '../common/defined';
import { state } from './pina';

const message = inject(keyMessage)!;

// 当前激活的标签页
const activeTab = ref('local');

async function showVersion() {
    try {
        const version_res:IGetVersionRes = await cocosEditorBridge.getVersion();
        console.log('version_res',version_res)
        message({ message: `编辑器版本: ${version_res.version}` });
    } catch (error) {
        message({ message: '获取版本失败: ' + error, type: 'error' });
    }
}
</script>

<template>
    <div class="container">
        <div class="header">
            <div class="actions">
                <el-button type="default" @click="showVersion">get creator version</el-button>
            </div> 
        </div>

        <el-tabs v-model="activeTab" class="main-tabs">
            <el-tab-pane label="ui组件库" name="components">
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
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #1a1a1a;
    color: #e4e7ed;
}

.header {
    padding: 10px 20px;
    border-bottom: 1px solid #2c2c2c;
    background-color: #262626;
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
    background-color: #1a1a1a;
}

/* 主标签页滚动条样式 */
.main-tabs::-webkit-scrollbar {
    width: 8px;
}

.main-tabs::-webkit-scrollbar-track {
    background: #2c2c2c;
    border-radius: 4px;
}

.main-tabs::-webkit-scrollbar-thumb {
    background: #606266;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.main-tabs::-webkit-scrollbar-thumb:hover {
    background: #909399;
}

.installed-components {
    padding: 20px;
    height: calc(100vh - 120px); /* 减去头部和标签页的高度 */
    overflow-y: auto;
    background-color: #1a1a1a;
    box-sizing: border-box;
}

/* 已安装组件滚动条样式 */
.installed-components::-webkit-scrollbar {
    width: 8px;
}

.installed-components::-webkit-scrollbar-track {
    background: #2c2c2c;
    border-radius: 4px;
}

.installed-components::-webkit-scrollbar-thumb {
    background: #606266;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.installed-components::-webkit-scrollbar-thumb:hover {
    background: #909399;
}

.local-components {
    padding: 20px;
    height: calc(100vh - 120px); /* 减去头部和标签页的高度 */
    overflow-y: auto;
    background-color: #1a1a1a;
    box-sizing: border-box;
}

/* 自定义滚动条样式 */
.local-components::-webkit-scrollbar {
    width: 8px;
}

.local-components::-webkit-scrollbar-track {
    background: #2c2c2c;
    border-radius: 4px;
}

.local-components::-webkit-scrollbar-thumb {
    background: #606266;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.local-components::-webkit-scrollbar-thumb:hover {
    background: #909399;
}

.local-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.local-header h3 {
    margin: 0;
    color: #e4e7ed;
    font-weight: 600;
}

.header-controls {
    display: flex;
    align-items: center;
    gap: 10px;
}

.installed-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.installed-header h3 {
    margin: 0;
    color: #e4e7ed;
    font-weight: 600;
}

.loading-container {
    padding: 20px;
}

.empty-state {
    text-align: center;
    padding: 40px 20px;
}

.components-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 150px; /* 添加大量底部边距确保最后一个组件完全可见 */
}

/* 添加一个空白元素在列表底部 */
.components-list::after {
    content: "";
    display: block;
    height: 200px; /* 确保有足够的空间 */
    grid-column: 1 / -1;
}

/* 旧样式已移除，避免与新的组件卡片样式冲突 */

.card-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.uninstall-info {
    background-color: #2c2c2c;
    padding: 15px;
    border-radius: 6px;
    margin: 15px 0;
}

.uninstall-info p {
    margin: 8px 0;
    color: #909399;
}

.uninstall-info strong {
    color: #e4e7ed;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

/* Element Plus 标签页暗色主题 */
.main-tabs :deep(.el-tabs__header) {
    background-color: #262626;
    border-bottom: 1px solid #404040;
}

.main-tabs :deep(.el-tabs__nav-wrap) {
    background-color: #262626;
}

.main-tabs :deep(.el-tabs__item) {
     color: #909399;
     background-color: transparent;
 }

/* 新的组件网格布局 */
.components-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    padding: 20px 0;
}

/* 重新设计的组件卡片 */
.component-card {
    background-color: #262626;
    border: 1px solid #404040;
    border-radius: 12px;
    padding: 0;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    overflow: hidden;
}

.component-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    border-color: #606266;
}

/* 卡片头部 */
.card-header {
    background: linear-gradient(135deg, #2c2c2c 0%, #333333 100%);
    padding: 16px 20px;
    border-bottom: 1px solid #404040;
}

.card-title {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
}

.card-title h4 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #e4e7ed;
    line-height: 1.3;
}

.card-meta {
    display: flex;
    align-items: center;
    gap: 8px;
}

.version {
    background-color: #409eff;
    color: #ffffff;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.author {
    font-size: 13px;
    color: #909399;
    font-weight: 500;
}

/* 卡片内容 */
.card-content {
    padding: 20px;
}

.description {
    color: #c0c4cc;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.meta-info {
    margin-bottom: 16px;
}

.meta-item {
    display: flex;
    margin-bottom: 8px;
    font-size: 13px;
}

.meta-item .label {
    color: #909399;
    min-width: 80px;
    font-weight: 500;
}

.meta-item .value {
    color: #c0c4cc;
    flex: 1;
}

/* 标签 */
.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
}

.more-tags {
    color: #909399;
    font-size: 12px;
    padding: 2px 6px;
    background-color: #3a3a3a;
    border-radius: 10px;
}

/* 资源图标 */
.resource-icons {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
}

.resource-icon {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background-color: #3a3a3a;
    border-radius: 6px;
    font-size: 12px;
    color: #c0c4cc;
}

.resource-icon.script {
    background-color: rgba(103, 194, 58, 0.1);
    color: #67c23a;
}

.resource-icon.texture {
    background-color: rgba(230, 162, 60, 0.1);
    color: #e6a23c;
}

.resource-icon.prefab {
    background-color: rgba(64, 158, 255, 0.1);
    color: #409eff;
}

.resource-icon i {
    font-size: 14px;
}

/* 操作按钮 */
.actions {
    padding: 16px 20px;
    background-color: #2c2c2c;
    border-top: 1px solid #404040;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.main-tabs :deep(.el-tabs__item.is-active) {
    color: #409eff;
}

.main-tabs :deep(.el-tabs__item:hover) {
    color: #409eff;
}

.main-tabs :deep(.el-tabs__active-bar) {
    background-color: #409eff;
}

/* 自定义滚动条样式 */
.local-components::-webkit-scrollbar,
.installed-components::-webkit-scrollbar {
    width: 8px;
}

.local-components::-webkit-scrollbar-track,
.installed-components::-webkit-scrollbar-track {
    background-color: #2c2c2c;
    border-radius: 4px;
}

.local-components::-webkit-scrollbar-thumb,
.installed-components::-webkit-scrollbar-thumb {
    background-color: #606266;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.local-components::-webkit-scrollbar-thumb:hover,
.installed-components::-webkit-scrollbar-thumb:hover {
    background-color: #909399;
}
</style>
