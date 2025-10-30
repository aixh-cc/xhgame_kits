<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { inject } from 'vue';
import { name } from '../../../package.json';
import { keyAppRoot, keyMessage } from '../provide-inject';
import { apiService } from '../api-service';

// 包信息接口定义
interface IPackageInfo {
  /** 包名,英文字母 */
  name: string;
  /** 包显示名,中文字符 */
  displayName: string;
  /** 版本号 */
  version: string;
  /** 说明 */
  description: string;
  /** 作者 */
  author: string;
  /** 分类 */
  category: string;
  /** 标签 */
  tags: string[];
  /** 包所在路径 */
  path: string;
  /** 依赖 */
  dependencies: string[];
  /** 安装文件 */
  files: string[];
  /** 安装状态 */
  installStatus?: string;
  /** 备份状态 */
  backupStatus?: string;
  /** 是否需要更新 */
  needsUpdate?: boolean;
  /** 评分 */
  stars?: number;
  /** 包ID */
  id?: number;
  /** 使用方法 */
  usage?: string;
}

const appRootDom = inject(keyAppRoot);
const message = inject(keyMessage)!;

// 折叠卡片状态管理
const expandedCards = ref<Record<number, number>>({});

// 当前激活的标签页
const activeTab = ref('all');

// 检查卡片是否展开
const isCardExpanded = (id: number) => {
  return expandedCards.value[id] === id;
};

// 计算属性：已安装组件
const installedComponents = computed(() => {
  return componentList.value.filter(comp => comp.installStatus === 'has');
});

// 计算属性：可更新组件
const updatableComponents = computed(() => {
  return componentList.value.filter(comp => comp.installStatus === 'has' && comp.needsUpdate);
});

// 计算属性：根据标签页筛选的组件
const filteredComponents = computed(() => {
  switch (activeTab.value) {
    case 'installed':
      return installedComponents.value;
    case 'updates':
      return updatableComponents.value;
    default:
      return componentList.value;
  }
});

// 组件列表数据
let componentList = ref<IPackageInfo[]>([]);
// 获取组件列表的异步函数
const loadComponents = async () => {
  try {
    const response = await apiService.getPackages();
    componentList.value = response.data.packages || [];
    console.log('获取组件列表成功', response);
  } catch (error) {
    console.error('Failed to load components:', error);
    ElMessage.error('获取组件列表失败');
  }
};

// 在组件挂载时获取数据
onMounted(() => {
  loadComponents();
});

// 从插件assets安装组件
async function installFromAssets(component: any) {
  if(component.installStatus === 'has'){
    return 
  }
  console.log(`[xhgame_plugin] 安装【本地组件】请求:`, component.name);
  try {
    // 确认安装
    const confirmMessage = `确定要从插件内置资源安装 "${component.name}" 组件到项目吗？`;
    await ElMessageBox.confirm(
      confirmMessage,
      '确认安装',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        appendTo: appRootDom
      }
    );
    
    message({
      message: `正在安装 ${component.name}...`,
      type: 'info'
    });
    
    // 调用后端API进行文件复制
    const result = await Editor.Message.request(name, 'install-from-assets', {
      componentName: component.name,
      componentId: component.id,
      componentCode: component.code
    });
    
    if (result && result.success) {
      message({
        message: `${component.name} 从内置资源安装成功！`,
        type: 'success'
      });
    } else {
      message({
        message: result.message,
        type: 'error'
      });
    }
  } catch (error: any) {
    if (error === 'cancel') return;
    
    message({
      message: `安装失败: ${error.message || error}`,
      type: 'error'
    });
  }
}
</script>

<template>
  <div class="comp-list-container">
    <h2>组件库</h2>
    <p class="description">从下方列表中选择并安装组件到您的项目中</p>
    
    <!-- 组件筛选标签 -->
    <el-tabs v-model="activeTab" class="comp-filter-tabs">
      <el-tab-pane label="全部组件" name="all">
        <div class="tab-content">
          <div class="tab-stats">共 {{ filteredComponents.length }} 个组件</div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="已安装组件" name="installed">
        <div class="tab-content">
          <div class="tab-stats">已安装 {{ installedComponents.length }} 个组件</div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="可更新组件" name="updates">
        <div class="tab-content">
          <div class="tab-stats">有 {{ updatableComponents.length }} 个组件可更新</div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 组件列表 -->
    <div class="components-grid">
      <el-card v-for="component in filteredComponents" :key="component.id" class="component-card" :class="{ 'installed': component.installStatus === 'has' }">
      <template #header>
        <div class="card-header">
          <div class="card-title">
            <h3>{{ component.name }}</h3><span class="version">v{{ component.version }}</span>
            <el-tag v-if="component.needsUpdate" type="warning" size="small">可更新</el-tag>
          </div>
          <div class="card-meta">
            <span class="author">作者: {{ component.author }}</span>
            <div class="rating">
              <el-rate v-model="component.stars" disabled text-color="#ff9900" score-template="{value}" />
            </div>
          </div>
        </div>
      </template>
      
      <div class="card-content">
        <div class="tags">
          <el-tag v-for="tag in component.tags" :key="tag" size="small" effect="plain" class="tag">{{ tag }}</el-tag>
        </div>
        
        <el-collapse v-model="expandedCards[component.id || 0]">
          <el-collapse-item class="compent-content" :name="component.id || 0">
            <template #title>
              <div class="collapse-title">
                <span class="description-preview">{{ component.description.substring(0, 50) }}{{ component.description.length > 50 ? '...' : '' }}</span>
                <span class="collapse-hint">{{ isCardExpanded(component.id || 0) ? '收起详情' : '展开详情' }}</span>
              </div>
            </template>
            
            <div class="description">
              <h4>描述</h4>
              <p>{{ component.description }}</p>
            </div>
            
            <div class="usage">
              <h4>使用方法</h4>
              <p>{{ component.usage }}</p>
            </div>
            
            <div class="target-paths">
              <h4>安装路径</h4>
              <ul>
                <li v-for="(target, index) in component.files" :key="index">
                  {{ target }} 
                </li>
              </ul>
            </div>
          </el-collapse-item>
        </el-collapse>
        
        <div class="actions">
          <el-button 
            type="success" 
            @click="installFromAssets(component)">
             {{ component.installStatus === 'has' ? (component.needsUpdate ? '更新' : '已安装') : '下载安装' }}
          </el-button>
          
        </div>
      </div>
    </el-card>
  </div>
  </div>
</template>

<style scoped>
.comp-list-container {
  padding: 20px;
  height: calc(100vh - 150px);
  overflow-y: auto;
  padding-bottom: 120px; /* 增加更多底部空间 */
}

.comp-filter-tabs {
  margin-bottom: 20px;
}

.tab-content {
  padding: 10px 0;
}

.tab-stats {
  font-size: 14px;
  color: #909399;
  margin-bottom: 15px;
}

.components-grid {
  display: grid;
  gap: 20px;
  margin-bottom: 150px; /* 添加大量底部边距确保最后一个组件完全可见 */
}

/* 添加一个空白元素在列表底部 */
.components-grid::after {
  content: "";
  display: block;
  height: 200px; /* 确保有足够的空间 */
  grid-column: 1 / -1;
}

.description {
  color: #666;
  margin-bottom: 20px;
}

.component-card {
  margin-bottom: 20px;
  border-radius: 8px;
  transition: all 0.3s;
}

.component-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #666;
}

.card-content p {
  margin: 0;
  font-size: 14px;
}

.actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.resource-icons {
  display: flex;
  gap: 8px;
}

.resource-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  position: relative;
}

.resource-icon i {
  font-size: 16px;
}

.resource-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #f56c6c;
  color: white;
  border-radius: 10px;
  padding: 0 5px;
  font-size: 10px;
  min-width: 15px;
  text-align: center;
}

.resource-icon.script {
  background-color: #409eff;
  color: white;
}

.resource-icon.texture {
  background-color: #67c23a;
  color: white;
}

.resource-icon.audio {
  background-color: #e6a23c;
  color: white;
}

.resource-icon.plist {
  background-color: #f56c6c;
  color: white;
}

.resource-icon.prefab {
  background-color: #909399;
  color: white;
}

.resource-icon.config {
  background-color: #9254de;
  color: white;
}

.path-type-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 3px;
  margin-right: 5px;
}

.path-type-icon i {
  font-size: 12px;
}

.collapse-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.description-preview {
  color: #606266;
  font-size: 14px;
}

.collapse-hint {
  color: #409eff;
  font-size: 12px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.author {
  font-size: 14px;
  color: #666;
}

.rating {
  display: flex;
  align-items: center;
  gap: 5px;
}

.review-count {
  font-size: 12px;
  color: #999;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.tag {
  margin-right: 0;
}

.path-desc {
  color: #999;
  font-size: 12px;
}

.installed {
  border: 1px solid #67c23a;
}

.installed .el-card__header {
  background-color: rgba(103, 194, 58, 0.1);
}

/* 评价对话框样式 */
.review-dialog :deep(.el-dialog__body) {
  max-height: 400px;
  overflow-y: auto;
  padding: 20px;
}

.review-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.review-user {
  font-weight: bold;
  color: #409EFF;
}

.review-date {
  color: #999;
  font-size: 12px;
}

.review-rating {
  margin-bottom: 10px;
}

.review-comment {
  color: #333;
  line-height: 1.6;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  border-left: 3px solid #409EFF;
}

.no-reviews {
  text-align: center;
  color: #999;
  padding: 30px;
  font-size: 14px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.dialog-footer {
  text-align: right;
  margin-top: 15px;
}

.no-reviews {
  text-align: center;
  padding: 20px;
  color: #999;
}
.version {
    background-color: #409eff;
    color: #ffffff;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}
.compent-content{
  text-align: left;
}
</style>