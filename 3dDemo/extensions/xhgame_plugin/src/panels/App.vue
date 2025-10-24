<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted, watch } from 'vue';

import { ElMessage } from 'element-plus';

import { name } from '../../package.json';

import HelloWorld from './components/HelloWorld.vue';
import CompList from './components/CompList.vue';
import { state } from './pina';
import { keyAppRoot, keyMessage } from './provide-inject';
import cocosEditorBridge from './cocos-bridge';

// 定义已安装组件的类型
interface InstalledComponent {
  componentName: string;
  componentId: string;
  componentCode: string;
  version: string;
  installedAt: string;
  copiedFiles: string[];
}

const appRootDom = inject(keyAppRoot);
const message = inject(keyMessage)!;

// 当前激活的标签页
const activeTab = ref('components');

// Cocos 编辑器连接状态
const editorConnected = ref(false);

// 已安装组件列表
const installedComponents = ref<InstalledComponent[]>([]);
const loadingInstalled = ref(false);

// 卸载组件相关状态
const uninstallingComponents = ref(new Set<string>());
const uninstallDialogVisible = ref(false);
const currentUninstallComponent = ref<InstalledComponent | null>(null);

// 本地组件库相关状态
const localComponents = ref<any[]>([]);
const loadingLocal = ref(false);
const installingLocalComponents = ref(new Set<string>());

// 备份文件相关状态
const componentBackups = ref<Map<string, any>>(new Map());
const restoringBackups = ref(new Set<string>());

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

// 获取已安装组件列表
async function loadInstalledComponents() {
    loadingInstalled.value = true;
    try {
        const result = await cocosEditorBridge.getInstalledComponents();
        if (result.success) {
            installedComponents.value = result.components;
            message({ 
                message: `已加载 ${result.components.length} 个已安装组件`, 
                type: 'success' 
            });
        } else {
            message({ 
                message: '获取已安装组件列表失败: ' + result.error, 
                type: 'error' 
            });
        }
    } catch (error) {
        message({ 
            message: '获取已安装组件列表失败: ' + error, 
            type: 'error' 
        });
    } finally {
        loadingInstalled.value = false;
    }
}

// 移除已安装组件记录
async function removeInstalledComponent(componentCode: string) {
    try {
        const result = await cocosEditorBridge.removeInstalledComponent({ componentCode });
        if (result.success) {
            message({ 
                message: result.message, 
                type: 'success' 
            });
            // 重新加载列表
            await loadInstalledComponents();
        } else {
            message({ 
                message: '移除组件记录失败: ' + result.error, 
                type: 'error' 
            });
        }
    } catch (error) {
        message({ 
            message: '移除组件记录失败: ' + error, 
            type: 'error' 
        });
    }
}

// 显示卸载确认对话框
function showUninstallDialog(component: InstalledComponent) {
    currentUninstallComponent.value = component;
    uninstallDialogVisible.value = true;
}

// 确认卸载组件
async function confirmUninstallComponent() {
    if (!currentUninstallComponent.value) return;
    
    const componentCode = currentUninstallComponent.value.componentCode;
    const componentName = currentUninstallComponent.value.componentName;
    
    try {
        uninstallingComponents.value.add(componentCode);
        uninstallDialogVisible.value = false;
        
        const result = await cocosEditorBridge.uninstallComponent({ componentCode });
        
        if (result.success) {
            message({ 
                message: result.message || `组件 ${componentName} 卸载成功！`, 
                type: 'success',
                duration: 5000
            });
            
            // 刷新已安装组件列表和本地组件列表
            await loadInstalledComponents();
            await loadLocalComponents();
        } else {
            message({ 
                message: result.message || `组件 ${componentName} 卸载失败`, 
                type: 'error' 
            });
        }
    } catch (error) {
        message({ 
            message: `卸载组件失败: ${error}`, 
            type: 'error' 
        });
    } finally {
        uninstallingComponents.value.delete(componentCode);
        currentUninstallComponent.value = null;
    }
}

// 取消卸载
function cancelUninstall() {
    uninstallDialogVisible.value = false;
    currentUninstallComponent.value = null;
}

// 获取本地组件库列表
async function loadLocalComponents() {
    loadingLocal.value = true;
    try {
        const result = await cocosEditorBridge.getLocalComponents();
        console.log('result',result)
        if (result.success) {
            localComponents.value = result.components;
            message({ 
                message: `已加载 ${result.components.length} 个本地组件`, 
                type: 'success' 
            });
            
            // 加载完本地组件后检查备份状态
            await checkAllComponentBackups();
        } else {
            message({ 
                message: '获取本地组件库列表失败: ' + result.error, 
                type: 'error' 
            });
        }
    } catch (error) {
        message({ 
            message: '获取本地组件库列表失败: ' + error, 
            type: 'error' 
        });
    } finally {
        loadingLocal.value = false;
    }
}

// 安装本地组件到项目
async function installLocalComponent(component: any) {
    installingLocalComponents.value.add(component.name);
    try {
        const result = await cocosEditorBridge.installLocalComponent(
            component.displayName || component.name,
            component.name,
            component.localPath
        );
        
        if (result.success) {
            message({ 
                message: result.message || `本地组件 ${component.displayName || component.name} 安装成功！`, 
                type: 'success' 
            });
            // 重新加载已安装组件列表和本地组件列表
            loadInstalledComponents();
            loadLocalComponents();
        } else {
            message({ 
                message: result.error || '安装本地组件失败', 
                type: 'error' 
            });
        }
    } catch (error) {
        message({ 
            message: `安装本地组件失败: ${error}`, 
            type: 'error' 
        });
    } finally {
        installingLocalComponents.value.delete(component.name);
    }
}

// 检测组件是否有备份文件
async function checkComponentBackup(componentCode: string) {
    console.log(`[xhgame_plugin] 检测组件备份: ${componentCode}`);
    try {
        const result = await cocosEditorBridge.checkBackupExists(componentCode);
        console.log(`[xhgame_plugin] 组件备份检测结果: ${componentCode}`, result);
        console.log(`[xhgame_plugin] result.exists: ${result.exists}, result.backupInfo:`, result.backupInfo);
        
        if (result.exists) {
            // 确保存储的对象包含exists字段
            const backupData = {
                ...result.backupInfo,
                exists: true,
                backupPath: result.backupPath
            };
            componentBackups.value.set(componentCode, backupData);
            console.log(`[xhgame_plugin] 已添加到componentBackups: ${componentCode}`, componentBackups.value.get(componentCode));
        } else {
            componentBackups.value.delete(componentCode);
            console.log(`[xhgame_plugin] 从componentBackups中删除: ${componentCode}`);
        }
        
        // 打印当前所有备份状态
        console.log(`[xhgame_plugin] 当前componentBackups状态:`, Array.from(componentBackups.value.entries()));
        
        return result;
    } catch (error) {
        console.error(`检测组件备份失败: ${componentCode}`, error);
        componentBackups.value.delete(componentCode);
        return { exists: false };
    }
}

// 批量检测所有本地组件的备份文件
async function checkAllComponentBackups() {
    for (const component of localComponents.value) {
        await checkComponentBackup(component.name);
    }
}

// 从备份恢复组件
async function restoreComponentFromBackup(component: any) {
    const componentCode = component.name;
    const backup = componentBackups.value.get(componentCode);
    
    if (!backup || !backup.exists) {
        message({ 
            message: `组件 ${component.displayName || component.name} 没有找到备份文件`, 
            type: 'error' 
        });
        return;
    }
    
    restoringBackups.value.add(componentCode);
    try {
        const result = await cocosEditorBridge.restoreFromBackup(componentCode, '');
        
        if (result.success) {
            message({ 
                message: result.message || `组件 ${component.displayName || component.name} 从备份恢复成功！`, 
                type: 'success',
                duration: 5000
            });
            
            // 重新加载已安装组件列表和本地组件列表
            await loadInstalledComponents();
            await loadLocalComponents();
            await checkAllComponentBackups();
        } else {
            message({ 
                message: result.error || `组件 ${component.displayName || component.name} 恢复失败`, 
                type: 'error' 
            });
        }
    } catch (error) {
        message({ 
            message: `恢复组件失败: ${error}`, 
            type: 'error' 
        });
    } finally {
        restoringBackups.value.delete(componentCode);
    }
}

// 测试编辑器通信功能
async function testEditorCommunication() {
    try {
        // 测试获取场景信息
        const sceneInfo = await cocosEditorBridge.getSceneInfo();
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
    
    // 监听连接状态变化
    watch(editorConnected, (newValue, oldValue) => {
        if (newValue !== oldValue) {
            message({ 
                message: newValue ? '已连接到 Cocos Creator 编辑器' : '开发模式 - 使用模拟编辑器环境',
                type: newValue ? 'success' : 'warning'
            });
        }
    });

    // 初始提示
    message({ 
        message: editorConnected.value ? '已连接到 Cocos Creator 编辑器' : '开发模式 - 使用模拟编辑器环境',
        type: editorConnected.value ? 'success' : 'warning'
    });
    
    // 加载已安装组件列表
    loadInstalledComponents();
    
    // 加载本地组件库列表
    loadLocalComponents().then(() => {
        // 加载完本地组件后检测备份文件
        checkAllComponentBackups();
    });
});

// 监听标签页切换
watch(activeTab, (newTab, oldTab) => {
    console.log(`[xhgame_plugin] 标签页切换: ${oldTab} -> ${newTab}`);
    
    // 当切换到本地组件标签页时，重新检查备份状态
    if (newTab === 'local') {
        console.log('[xhgame_plugin] 切换到本地组件标签页，重新检查备份状态');
        checkAllComponentBackups();
    }
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
            <el-tab-pane label="网络组件库" name="components">
                <CompList />
            </el-tab-pane>
            <el-tab-pane label="本地组件库" name="local">
                <div class="local-components">
                    <div class="local-header">
                        <h3>本地组件库</h3>
                        <el-button 
                            type="primary" 
                            @click="loadLocalComponents" 
                            :loading="loadingLocal"
                            size="small"
                        >
                            刷新列表
                        </el-button>
                    </div>
                    
                    <div v-if="loadingLocal" class="loading-container">
                        <el-skeleton :rows="3" animated />
                    </div>
                    
                    <div v-else-if="localComponents.length === 0" class="empty-state">
                        <el-empty description="暂无本地组件" />
                    </div>
                    
                    <div v-else class="components-list">
                        <el-card 
                            v-for="component in localComponents" 
                            :key="component.name"
                            class="component-card"
                            shadow="hover"
                        >
                            <template #header>
                                <div class="card-header">
                                    <span class="component-name">{{ component.displayName || component.name }}</span>
                                    <el-tag type="info" size="small">v{{ component.version }}</el-tag>
                                    <el-tag type="success" size="small" v-if="component.status === 'installed'">本地</el-tag>
                                </div>
                            </template>
                            
                            <div class="component-info">
                                <p><strong>组件名称:</strong> {{ component.name }}</p>
                                <p><strong>描述:</strong> {{ component.description || '暂无描述' }}</p>
                                <p v-if="component.author"><strong>作者:</strong> {{ component.author }}</p>
                                <p v-if="component.category"><strong>分类:</strong> {{ component.category }}</p>
                                <p v-if="component.installDate"><strong>安装时间:</strong> {{ new Date(component.installDate).toLocaleString() }}</p>
                                <div v-if="component.features && component.features.length > 0">
                                    <p><strong>功能特性:</strong></p>
                                    <ul class="feature-list">
                                        <li v-for="feature in component.features" :key="feature">{{ feature }}</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <template #footer>
                                <div class="card-actions">
                                    <el-button 
                                        type="primary" 
                                        size="small" 
                                        @click="installLocalComponent(component)"
                                        :loading="installingLocalComponents.has(component.name)"
                                        v-if="component.status !== 'installed'"
                                    >
                                        安装到项目
                                    </el-button>
                                    <el-button 
                                        type="success" 
                                        size="small" 
                                        disabled
                                        v-if="component.status === 'installed'"
                                    >
                                        已安装
                                    </el-button>

                                    <el-button 
                                        type="warning" 
                                        size="small" 
                                        @click="restoreComponentFromBackup(component)"
                                        :loading="restoringBackups.has(component.name)"
                                        v-if="componentBackups.has(component.name) && componentBackups.get(component.name)?.exists"
                                    >
                                        回撤备份到项目
                                    </el-button>
                                </div>
                            </template>
                        </el-card>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="已安装组件" name="installed">
                <div class="installed-components">
                    <div class="installed-header">
                        <h3>已安装的组件</h3>
                        <el-button 
                            type="primary" 
                            @click="loadInstalledComponents" 
                            :loading="loadingInstalled"
                            size="small"
                        >
                            刷新列表
                        </el-button>
                    </div>
                    
                    <div v-if="loadingInstalled" class="loading-container">
                        <el-skeleton :rows="3" animated />
                    </div>
                    
                    <div v-else-if="installedComponents.length === 0" class="empty-state">
                        <el-empty description="暂无已安装的组件" />
                    </div>
                    
                    <div v-else class="components-list">
                        <el-card 
                            v-for="component in installedComponents" 
                            :key="component.componentCode"
                            class="component-card"
                            shadow="hover"
                        >
                            <template #header>
                                <div class="card-header">
                                    <span class="component-name">{{ component.componentName }}</span>
                                    <el-tag type="success" size="small">v{{ component.version }}</el-tag>
                                </div>
                            </template>
                            
                            <div class="component-info">
                                <p><strong>组件ID:</strong> {{ component.componentId }}</p>
                                <p><strong>组件代码:</strong> {{ component.componentCode }}</p>
                                <p><strong>安装时间:</strong> {{ new Date(component.installedAt).toLocaleString() }}</p>
                                <p><strong>复制的文件:</strong></p>
                                <ul class="file-list">
                                    <li v-for="file in component.copiedFiles" :key="file">{{ file }}</li>
                                </ul>
                            </div>
                            
                            <template #footer>
                                <div class="card-actions">
                                    <el-button 
                                        type="warning" 
                                        size="small" 
                                        @click="showUninstallDialog(component)"
                                        :loading="uninstallingComponents.has(component.componentCode)"
                                    >
                                        卸载组件
                                    </el-button>
                                    <el-button 
                                        type="danger" 
                                        size="small" 
                                        @click="removeInstalledComponent(component.componentCode)"
                                    >
                                        移除记录
                                    </el-button>
                                </div>
                            </template>
                        </el-card>
                    </div>
                    
                    <!-- 卸载确认对话框 -->
                    <el-dialog
                        v-model="uninstallDialogVisible"
                        title="确认卸载组件"
                        width="500px"
                        :before-close="cancelUninstall"
                    >
                        <div v-if="currentUninstallComponent">
                            <p><strong>您确定要卸载以下组件吗？</strong></p>
                            <div class="uninstall-info">
                                <p><strong>组件名称:</strong> {{ currentUninstallComponent.componentName }}</p>
                                <p><strong>组件代码:</strong> {{ currentUninstallComponent.componentCode }}</p>
                                <p><strong>版本:</strong> v{{ currentUninstallComponent.version }}</p>
                                <p><strong>安装时间:</strong> {{ new Date(currentUninstallComponent.installedAt).toLocaleString() }}</p>
                            </div>
                            <el-alert
                                title="注意"
                                type="warning"
                                :closable="false"
                                show-icon
                            >
                                <p>卸载操作将会：</p>
                                <ul>
                                    <li>将组件相关文件备份到 extensions/xhgame_plugin/backup 目录</li>
                                    <li>从项目中删除组件文件</li>
                                    <li>从已安装组件列表中移除记录</li>
                                </ul>
                                <p><strong>此操作不可逆，请谨慎操作！</strong></p>
                            </el-alert>
                        </div>
                        
                        <template #footer>
                            <span class="dialog-footer">
                                <el-button @click="cancelUninstall">取消</el-button>
                                <el-button type="danger" @click="confirmUninstallComponent">
                                    确认卸载
                                </el-button>
                            </span>
                        </template>
                    </el-dialog>
                </div>
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
    overflow: hidden;
    padding: 0 20px;
    display: flex;
    flex-direction: column;
}

.main-tabs :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;
}

.main-tabs :deep(.el-tab-pane) {
    height: 100%;
    overflow: hidden;
}

.installed-components {
    padding: 20px;
    height: 100%;
    overflow-y: auto;
}

.local-components {
    padding: 20px;
    height: 100%;
    overflow-y: auto;
}

.local-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.local-header h3 {
    margin: 0;
    color: #303133;
}

.installed-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.installed-header h3 {
    margin: 0;
    color: #303133;
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

.component-card {
    border-radius: 8px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.component-name {
    font-weight: bold;
    font-size: 16px;
    color: #303133;
}

.component-info {
    margin-bottom: 15px;
}

.component-info p {
    margin: 8px 0;
    color: #606266;
    font-size: 14px;
}

.component-info strong {
    color: #303133;
}

.file-list {
    margin: 5px 0 0 20px;
    padding: 0;
}

.file-list li {
    margin: 3px 0;
    color: #909399;
    font-size: 12px;
    font-family: monospace;
}

.card-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.uninstall-info {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 6px;
    margin: 15px 0;
}

.uninstall-info p {
    margin: 8px 0;
    color: #606266;
}

.uninstall-info strong {
    color: #303133;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>
