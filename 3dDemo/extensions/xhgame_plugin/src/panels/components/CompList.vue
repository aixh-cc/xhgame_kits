<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { inject } from 'vue';
import { name } from '../../../package.json';
import { keyAppRoot, keyMessage } from '../provide-inject';

const appRootDom = inject(keyAppRoot);
const message = inject(keyMessage)!;

// 资源类型枚举
const ResourceType = {
  SCRIPT: 'script',
  TEXTURE: 'texture',
  AUDIO: 'audio',
  PLIST: 'plist',
  PREFAB: 'prefab',
  CONFIG: 'config',
  OTHER: 'other'
};

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
  return componentList.value.filter(comp => comp.installed);
});

// 计算属性：可更新组件
const updatableComponents = computed(() => {
  return componentList.value.filter(comp => comp.installed && comp.needsUpdate);
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

// 获取资源类型图标
const getResourceTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    [ResourceType.SCRIPT]: 'el-icon-document',
    [ResourceType.TEXTURE]: 'el-icon-picture-outline',
    [ResourceType.AUDIO]: 'el-icon-headset',
    [ResourceType.PLIST]: 'el-icon-files',
    [ResourceType.PREFAB]: 'el-icon-s-grid',
    [ResourceType.CONFIG]: 'el-icon-setting',
    [ResourceType.OTHER]: 'el-icon-more'
  };
  return iconMap[type] || 'el-icon-more';
};

// 获取资源类型名称
const getResourceTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    [ResourceType.SCRIPT]: '脚本',
    [ResourceType.TEXTURE]: '纹理',
    [ResourceType.AUDIO]: '音频',
    [ResourceType.PLIST]: '图集',
    [ResourceType.PREFAB]: '预制体',
    [ResourceType.CONFIG]: '配置',
    [ResourceType.OTHER]: '其他'
  };
  return nameMap[type] || '其他';
};

// 获取按钮文本
const getActionButtonText = (comp: any) => {
  if (!comp.installed) return '下载安装';
  if (comp.needsUpdate) return '更新';
  return '已安装';
};

// 组件列表数据
const componentList = ref([
  {
    id: 1,
    name: '3D角色控制器',
    code: 'CharacterController',
    description: '基础的3D角色控制器，支持WASD移动和鼠标视角控制',
    usage: '将组件拖拽到角色对象上，设置相机引用即可使用',
    downloadUrl: 'https://example.com/components/character-controller.zip',
    version: '1.2.0',
    latestVersion: '1.2.0',
    resources: [
      { type: ResourceType.SCRIPT, count: 3 },
      { type: ResourceType.TEXTURE, count: 2 },
      { type: ResourceType.PREFAB, count: 1 }
    ],
    targetPaths: [
      { path: 'assets/script/components/', description: '主要脚本' },
      { path: 'assets/prefabs/controllers/', description: '预制体' },
      { path: 'assets/textures/controllers/', description: '纹理资源' }
    ],
    author: '张三',
    stars: 4.8,
    reviewCount: 256,
    installed: true,
    installedVersion: '1.1.0',
    needsUpdate: true,
    installedPaths: [
      { path: 'assets/script/components/CharacterController.ts', description: '主控制器脚本', type: ResourceType.SCRIPT },
      { path: 'assets/script/components/InputManager.ts', description: '输入管理脚本', type: ResourceType.SCRIPT },
      { path: 'assets/script/components/CameraFollow.ts', description: '相机跟随脚本', type: ResourceType.SCRIPT },
      { path: 'assets/prefabs/controllers/PlayerController.prefab', description: '角色控制器预制体', type: ResourceType.PREFAB },
      { path: 'assets/textures/controllers/joystick.png', description: '虚拟摇杆纹理', type: ResourceType.TEXTURE },
      { path: 'assets/textures/controllers/buttons.png', description: '控制按钮纹理', type: ResourceType.TEXTURE }
    ],
    tags: ['角色控制', '3D', '移动']
  },
  {
    id: 2,
    name: 'help组件',
    code:'HelpAndChat',
    description: '基于物理引擎的交互系统，支持拾取、投掷和碰撞反馈',
    usage: '添加到场景中的Manager对象，并配置相关参数',
    downloadUrl: 'http://hcz.jk-kj.com/xhgame_plugin_comps/HelpComp.zip',
    version: '2.0.1',
    latestVersion: '2.0.1',
    resources: [
      { type: ResourceType.SCRIPT, count: 4 },
      { type: ResourceType.PREFAB, count: 2 },
      { type: ResourceType.AUDIO, count: 3 }
    ],
    targetPaths: [
      { path: 'assets/script/comps/third/HelpComp', description: 'comps脚本' }
    ],
    author: '李四',
    stars: 4.5,
    reviewCount: 128,
    installed: false,
    installedVersion: '',
    needsUpdate: false,
    installedPaths: [],
    tags: ['物理', '交互', '系统']
  },
  {
    id: 3,
    name: 'UI管理器',
    code: 'UIManager',
    description: '完整的UI管理系统，支持界面层级、过渡动画和数据绑定',
    usage: '在项目中创建UIManager单例，通过API调用打开和关闭界面',
    downloadUrl: 'https://example.com/components/ui-manager.zip',
    version: '3.1.2',
    latestVersion: '3.1.2',
    resources: [
      { type: ResourceType.SCRIPT, count: 5 },
      { type: ResourceType.PREFAB, count: 3 },
      { type: ResourceType.TEXTURE, count: 8 },
      { type: ResourceType.PLIST, count: 2 },
      { type: ResourceType.AUDIO, count: 1 }
    ],
    targetPaths: [
      { path: 'assets/script/ui/', description: 'UI脚本' },
      { path: 'assets/prefabs/ui/', description: 'UI预制体' },
      { path: 'assets/resources/ui/', description: 'UI资源' },
      { path: 'assets/textures/ui/', description: 'UI纹理' }
    ],
    author: '王五',
    stars: 4.9,
    reviewCount: 312,
    installed: true,
    installedVersion: '3.1.2',
    needsUpdate: false,
    installedPaths: [
      { path: 'assets/script/ui/UIManager.ts', description: 'UI管理器脚本', type: ResourceType.SCRIPT },
      { path: 'assets/script/ui/UIPanel.ts', description: 'UI面板基类', type: ResourceType.SCRIPT },
      { path: 'assets/script/ui/UIAnimation.ts', description: 'UI动画控制器', type: ResourceType.SCRIPT },
      { path: 'assets/script/ui/UIDataBinding.ts', description: 'UI数据绑定', type: ResourceType.SCRIPT },
      { path: 'assets/script/ui/UIFactory.ts', description: 'UI工厂类', type: ResourceType.SCRIPT },
      { path: 'assets/prefabs/ui/UIRoot.prefab', description: 'UI根节点预制体', type: ResourceType.PREFAB },
      { path: 'assets/prefabs/ui/CommonPanels.prefab', description: '通用面板预制体', type: ResourceType.PREFAB },
      { path: 'assets/prefabs/ui/EffectLayers.prefab', description: '特效层预制体', type: ResourceType.PREFAB },
      { path: 'assets/textures/ui/common_buttons.plist', description: '通用按钮图集', type: ResourceType.PLIST },
      { path: 'assets/textures/ui/icons.plist', description: '图标图集', type: ResourceType.PLIST },
      { path: 'assets/audio/ui/ui_click.mp3', description: 'UI点击音效', type: ResourceType.AUDIO }
    ],
    tags: ['UI', '界面', '动画']
  },
  {
    id: 4,
    name: '存档系统',
    code: 'SaveManager',
    description: '跨平台存档系统，支持本地和云端存储，自动同步和冲突解决',
    usage: '初始化SaveManager并配置存储选项，使用API进行数据存取',
    downloadUrl: 'https://example.com/components/save-system.zip',
    version: '1.5.0',
    latestVersion: '1.5.0',
    resources: [
      { type: ResourceType.SCRIPT, count: 3 },
      { type: ResourceType.CONFIG, count: 2 }
    ],
    targetPaths: [
      { path: 'assets/script/systems/', description: '系统脚本' },
      { path: 'assets/resources/config/', description: '配置文件' }
    ],
    author: '赵六',
    stars: 4.7,
    reviewCount: 189,
    installed: false,
    installedVersion: '',
    needsUpdate: false,
    installedPaths: [],
    tags: ['存档', '数据', '云存储']
  }
]);

// 评价数据
const reviews = ref<Record<number, Array<{
  user: string;
  date: string;
  rating: number;
  comment: string;
}>>>({
  1: [
    { user: '用户A', rating: 5, comment: '非常好用的角色控制器，移动流畅，配置简单', date: '2023-10-15' },
    { user: '用户B', rating: 4, comment: '整体不错，但在某些特殊地形上有小问题', date: '2023-09-22' },
    { user: '用户C', rating: 5, comment: '完美解决了我的角色控制需求，强烈推荐！', date: '2023-08-30' }
  ],
  2: [
    { user: '用户D', rating: 4, comment: '物理交互效果很棒，但文档可以再详细些', date: '2023-10-10' },
    { user: '用户E', rating: 5, comment: '拾取和投掷的效果非常自然，节省了大量开发时间', date: '2023-09-18' }
  ],
  3: [
    { user: '用户F', rating: 5, comment: 'UI管理系统非常完善，层级管理很方便', date: '2023-10-12' },
    { user: '用户G', rating: 5, comment: '动画过渡效果很棒，用户体验提升明显', date: '2023-09-25' },
    { user: '用户H', rating: 4, comment: '功能强大，就是初始配置有点复杂', date: '2023-08-15' }
  ],
  4: [
    { user: '用户I', rating: 5, comment: '云端存储功能非常实用，跨平台同步完美', date: '2023-10-05' },
    { user: '用户J', rating: 4, comment: '整体不错，希望能增加更多的存储选项', date: '2023-09-20' }
  ]
});

// 当前查看的评价组件ID
const currentReviewComponentId = ref(null);
const reviewDialogVisible = ref(false);

// 显示评价对话框
function showReviews(component:any) {
  currentReviewComponentId.value = component.id;
  reviewDialogVisible.value = true;
}

// 下载并安装组件
async function downloadAndInstall(component:any) {
  try {
    // 确认信息
    let confirmMessage = '';
    let confirmTitle = '';
    let isUpdate = false;
    
    if (component.installed) {
      if (component.needsUpdate) {
        confirmMessage = `确定要更新 "${component.name}" 组件吗？\n当前版本: ${component.installedVersion}\n最新版本: ${component.version}`;
        confirmTitle = '确认更新';
        isUpdate = true;
      } else {
        message({
          message: `组件 "${component.name}" 已安装最新版本`,
          type: 'info'
        });
        return;
      }
    } else {
      const targetPathsText = component.targetPaths.map((t:any) => `${t.path} (${t.description})`).join('\n- ');
      confirmMessage = `确定要下载并安装 "${component.name}" 组件到以下路径吗？\n- ${targetPathsText}`;
      confirmTitle = '确认安装';
    }
    
    await ElMessageBox.confirm(
      confirmMessage,
      confirmTitle,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        appendTo: appRootDom
      }
    );
    
    // 模拟下载过程
    message({
      message: isUpdate ? `正在更新 ${component.name}...` : `正在下载 ${component.name}...`,
      type: 'info'
    });
    
    // 实际下载和安装逻辑
    // 这里需要调用Cocos Creator编辑器API进行实际操作
    try {
      const result = await Editor.Message.request(name, 'download-component', {
        url: component.downloadUrl,
        targetPaths: component.targetPaths,
        name: component.name,
        isUpdate: isUpdate,
        currentVersion: component.installedVersion,
        newVersion: component.version
      });
      
      if (result && result.success) {
        // 更新组件状态
        component.installed = true;
        component.installedVersion = component.version;
        component.needsUpdate = false;
        component.installedPaths = result.installedPaths || component.targetPaths.map((t:any) => ({
          path: t.path + component.name.replace(/\s+/g, '') + '.ts',
          description: t.description,
          type: ResourceType.SCRIPT
        }));
        
        message({
          message: isUpdate ? `${component.name} 更新成功！` : `${component.name} 安装成功！`,
          type: 'success'
        });
      } else {
        throw new Error(result?.error || (isUpdate ? '更新失败' : '安装失败'));
      }
    } catch (err: any) {
      message({
        message: `操作失败: ${err.message || err}`,
        type: 'error'
      });
    }
  } catch (error:any) {
    if (error === 'cancel') return;
    
    message({
      message: `操作失败: ${error.message || error}`,
      type: 'error'
    });
  }
}

// 从插件assets安装组件
async function installFromAssets(component: any) {
  console.log(`[xhgame_plugin] 安装【本地组件】请求:`, component.name);
  try {
    // 确认安装
    const confirmMessage = `确定要从插件内置资源安装 "${component.name}" 组件到项目的 assets/script 目录吗？`;
    
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
      throw new Error(result?.error || '安装失败');
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
      <el-card v-for="component in filteredComponents" :key="component.id" class="component-card" :class="{ 'installed': component.installed }">
      <template #header>
        <div class="card-header">
          <div class="card-title">
            <h3>{{ component.name }}</h3>
            <el-tag v-if="component.installed" type="success" size="small">已安装</el-tag>
            <el-tag v-if="component.needsUpdate" type="warning" size="small">可更新</el-tag>
          </div>
          <div class="card-meta">
            <span class="author">作者: {{ component.author }}</span>
            <div class="rating">
              <el-rate v-model="component.stars" disabled text-color="#ff9900" score-template="{value}" />
              <span class="review-count">({{ component.reviewCount }}评价)</span>
            </div>
            <div class="resource-icons" v-if="component.resources && component.resources.length">
              <el-tooltip v-for="resource in component.resources" :key="resource.type" :content="`${resource.type}: ${resource.count}个`" placement="top">
                <div class="resource-icon" :class="resource.type">
                  <i :class="getResourceTypeIcon(resource.type)"></i>
                  <span class="resource-count">{{ resource.count }}</span>
                </div>
              </el-tooltip>
            </div>
          </div>
        </div>
      </template>
      
      <div class="card-content">
        <div class="tags">
          <el-tag v-for="tag in component.tags" :key="tag" size="small" effect="plain" class="tag">{{ tag }}</el-tag>
        </div>
        
        <el-collapse v-model="expandedCards[component.id]">
          <el-collapse-item :name="component.id">
            <template #title>
              <div class="collapse-title">
                <span class="description-preview">{{ component.description.substring(0, 50) }}{{ component.description.length > 50 ? '...' : '' }}</span>
                <span class="collapse-hint">{{ isCardExpanded(component.id) ? '收起详情' : '展开详情' }}</span>
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
                <li v-for="(target, index) in component.targetPaths" :key="index">
                  {{ target.path }} <span class="path-desc">({{ target.description }})</span>
                </li>
              </ul>
            </div>
            
            <div v-if="component.installed && component.installedPaths.length > 0" class="installed-paths">
              <h4>已安装文件</h4>
              <ul>
                <li v-for="(installed, index) in component.installedPaths" :key="index">
                  <span class="path-type-icon" :class="installed.type">
                    <i :class="getResourceTypeIcon(installed.type)"></i>
                  </span>
                  {{ installed.path }} <span class="path-desc">({{ installed.description }})</span>
                </li>
              </ul>
            </div>
          </el-collapse-item>
        </el-collapse>
        
        <div class="actions">
          <el-button 
            :type="component.installed ? (component.needsUpdate ? 'warning' : 'success') : 'primary'" 
            :disabled="component.installed && !component.needsUpdate"
            @click="downloadAndInstall(component)">
            {{ component.installed ? (component.needsUpdate ? '更新' : '已安装') : '下载安装' }}
          </el-button>
          <el-button 
            type="success" 
            @click="installFromAssets(component)">
            Install
          </el-button>
          <el-button type="info" @click="showReviews(component)">
            查看评价 ({{ component.reviewCount }})
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
  </div>
  
  <!-- 评价对话框 -->
  <el-dialog
    v-model="reviewDialogVisible"
    :title="currentReviewComponentId ? componentList.find(c => c.id === currentReviewComponentId)?.name + ' 的评价' : '评价'"
    width="500px"
    :append-to-body="true"
    destroy-on-close
    class="review-dialog"
  >
    <div v-if="currentReviewComponentId && reviews[currentReviewComponentId]?.length">
      <div v-for="(review, index) in reviews[currentReviewComponentId]" :key="index" class="review-item">
        <div class="review-header">
          <span class="review-user">{{ review.user }}</span>
          <span class="review-date">{{ review.date }}</span>
        </div>
        <div class="review-rating">
          <el-rate v-model="review.rating" disabled text-color="#ff9900" />
        </div>
        <div class="review-comment">
          {{ review.comment }}
        </div>
      </div>
    </div>
    <div v-else class="no-reviews">
      暂无评价
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="reviewDialogVisible = false">返回</el-button>
      </div>
    </template>
  </el-dialog>
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
</style>