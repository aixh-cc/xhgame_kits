<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted, watch } from 'vue';

import { ElMessage } from 'element-plus';

import { name } from '../../package.json';

import HelloWorld from './components/HelloWorld.vue';
import CompList from './components/CompList.vue';
import { state } from './pina';
import { keyAppRoot, keyMessage } from './provide-inject';
import cocosEditorBridge from './cocos-bridge';
import { apiService } from './api-service';

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
const activeTab = ref('local');

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
const useBackendService = ref(false); // 是否使用后端服务

// 备份文件相关状态
const componentBackups = ref<Map<string, any>>(new Map());
const restoringBackups = ref(new Set<string>());

// 辅助函数：获取资源类型图标
const getResourceTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
        'script': 'el-icon-document',
        'texture': 'el-icon-picture-outline',
        'audio': 'el-icon-headset',
        'plist': 'el-icon-files',
        'prefab': 'el-icon-s-grid',
        'config': 'el-icon-setting',
        'other': 'el-icon-more'
    };
    return iconMap[type] || 'el-icon-more';
};

// 辅助函数：获取资源类型名称
const getResourceTypeName = (type: string) => {
    const nameMap: Record<string, string> = {
        'script': '脚本',
        'texture': '纹理',
        'audio': '音频',
        'plist': '图集',
        'prefab': '预制体',
        'config': '配置',
        'other': '其他'
    };
    return nameMap[type] || '其他';
};

// 辅助函数：处理组件资源数据
const processComponentResources = (component: any) => {
    // 如果组件没有资源信息，尝试从文件列表推断
    if (!component.resources && component.copiedFiles) {
        const resources: any = {};
        component.copiedFiles.forEach((file: string) => {
            const ext = file.split('.').pop()?.toLowerCase();
            if (ext === 'ts' || ext === 'js') {
                resources.script = (resources.script || 0) + 1;
            } else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
                resources.texture = (resources.texture || 0) + 1;
            } else if (ext === 'prefab') {
                resources.prefab = (resources.prefab || 0) + 1;
            }
        });
        return resources;
    }
    return component.resources || {};
};

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
        let result;
        
        if (useBackendService.value) {
            // 使用后端服务获取组件列表
            const response = await apiService.getPackages();
            console.log('origin response',response)
            if (response.success) {
                result = {
                    success: true,
                    components: response.data.packages
                };
            } else {
                result = {
                    success: false,
                    error: response.error
                };
            }
        } else {
            // 使用原有的编辑器桥接方式
            result = await cocosEditorBridge.getLocalComponents();
        }
        
        console.log('result', result);
        
        if (result.success) {
            localComponents.value = result.components;
            message({ 
                message: `已加载 ${result.components.length} 个本地组件 (${useBackendService.value ? '后端服务' : '编辑器桥接'})`, 
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
                message: result.error || '安装本地组件失败,具体到控制板日志查看', 
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
            <!-- <div class="logos">
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
            </div> -->
            
            <!-- <div class="actions">
                <el-button type="primary" @click="open">show message</el-button>
                <el-button type="danger" @click="open2">show inject message</el-button>
                <el-button type="default" @click="showVersion">get creator version</el-button>
                <el-button type="success" @click="testEditorCommunication">测试编辑器通信</el-button>
                <el-button type="warning" @click="simulateAssetChange" v-if="!editorConnected">模拟资源变化</el-button>
                <el-button type="info" @click="simulateNodeSelection" v-if="!editorConnected">模拟节点选择</el-button>
            </div> -->
<!--             
            <div class="status-bar">
                <el-tag :type="editorConnected ? 'success' : 'warning'">
                    {{ editorConnected ? '已连接编辑器' : '开发模式' }}
                </el-tag>
            </div> -->
        </div>
        
        <el-tabs v-model="activeTab" class="main-tabs">
            <el-tab-pane label="网络组件库" name="components">
                <CompList />
            </el-tab-pane>

            <el-tab-pane label="本地组件库" name="local">
                <div class="local-components">
                    <div class="local-header">
                        <h3>本地组件库</h3>
                        <div class="header-controls">
                            <el-switch
                                v-model="useBackendService"
                                active-text="后端服务"
                                inactive-text="编辑器桥接"
                                size="small"
                                style="margin-right: 10px;"
                            />
                            <el-button 
                                type="primary" 
                                @click="loadLocalComponents" 
                                :loading="loadingLocal"
                                size="small"
                            >
                                刷新列表
                            </el-button>
                        </div>
                    </div>
                    
                    <div v-if="loadingLocal" class="loading-container">
                        <el-skeleton :rows="3" animated />
                    </div>
                    
                    <div v-else-if="localComponents.length === 0" class="empty-state">
                        <el-empty description="暂无本地组件" />
                    </div>
                    
                    <div v-else class="components-grid">
                        <div 
                            v-for="component in localComponents" 
                            :key="component.name"
                            class="component-card"
                        >
                            <div class="card-header">
                                <div class="card-title">
                                    <h4>{{ component.displayName || component.name }}</h4>
                                    <div class="card-meta">
                                        <span class="version">v{{ component.version }}</span>
                                        <el-tag type="success" size="small" v-if="component.status === 'installed'">本地</el-tag>
                                    </div>
                                </div>
                                <div class="author">{{ component.author || '未知作者' }}</div>
                            </div>
                            
                            <div class="card-content">
                                <div class="description">
                                    {{ component.description || '暂无描述' }}
                                </div>
                                
                                <div class="meta-info">
                                    <div class="meta-item" v-if="component.category">
                                        <span class="label">分类:</span>
                                        <span class="value">{{ component.category }}</span>
                                    </div>
                                    <div class="meta-item" v-if="component.installDate">
                                        <span class="label">安装时间:</span>
                                        <span class="value">{{ new Date(component.installDate).toLocaleString() }}</span>
                                    </div>
                                </div>
                                
                                <div class="tags" v-if="component.features && component.features.length > 0">
                                    <el-tag 
                                        v-for="feature in component.features.slice(0, 3)" 
                                        :key="feature"
                                        size="small"
                                        type="info"
                                    >
                                        {{ feature }}
                                    </el-tag>
                                    <span v-if="component.features.length > 3" class="more-tags">
                                        +{{ component.features.length - 3 }}
                                    </span>
                                </div>
                                
                                <div class="resource-icons">
                                    <template v-for="(count, type) in processComponentResources(component)" :key="type">
                                        <div v-if="count > 0" :class="['resource-icon', String(type)]">
                                            <i :class="getResourceTypeIcon(String(type))"></i>
                                            <span>{{ count }}</span>
                                        </div>
                                    </template>
                                </div>
                            </div>
                            
                            <div class="actions">
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
                                    回撤备份
                                </el-button>
                            </div>
                        </div>
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
