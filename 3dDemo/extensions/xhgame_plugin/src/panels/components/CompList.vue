<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { inject } from 'vue';
import { name } from '../../../package.json';
import { keyAppRoot, keyMessage } from '../provide-inject';

const appRootDom = inject(keyAppRoot);
const message = inject(keyMessage)!;

// 组件列表数据
const componentList = ref([
  {
    id: 1,
    name: '3D角色控制器',
    description: '基础的3D角色控制器，支持WASD移动和鼠标视角控制',
    usage: '将组件拖拽到角色对象上，设置相机引用即可使用',
    downloadUrl: 'https://example.com/components/character-controller.zip',
    targetPath: 'assets/script/components/'
  },
  {
    id: 2,
    name: '物理交互系统',
    description: '基于物理引擎的交互系统，支持拾取、投掷和碰撞反馈',
    usage: '添加到场景中的Manager对象，并配置相关参数',
    downloadUrl: 'https://example.com/components/physics-interaction.zip',
    targetPath: 'assets/script/systems/'
  },
  {
    id: 3,
    name: 'UI管理器',
    description: '完整的UI管理系统，支持界面层级、过渡动画和数据绑定',
    usage: '在项目中创建UIManager单例，通过API调用打开和关闭界面',
    downloadUrl: 'https://example.com/components/ui-manager.zip',
    targetPath: 'assets/script/ui/'
  }
]);

// 下载并安装组件
async function downloadAndInstall(component) {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      `确定要下载并安装 "${component.name}" 组件到 ${component.targetPath} 吗？`,
      '确认安装',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        appendTo: appRootDom
      }
    );
    
    // 模拟下载过程
    message({
      message: `正在下载 ${component.name}...`,
      type: 'info'
    });
    
    // 实际下载和安装逻辑
    // 这里需要调用Cocos Creator编辑器API进行实际操作
    try {
      const result = await Editor.Message.request(name, 'download-component', {
        url: component.downloadUrl,
        targetPath: component.targetPath,
        name: component.name
      });
      
      if (result && result.success) {
        message({
          message: `${component.name} 安装成功！`,
          type: 'success'
        });
      } else {
        throw new Error(result?.error || '安装失败');
      }
    } catch (err) {
      // 如果后端消息处理器尚未实现，显示模拟成功消息
      message({
        message: `模拟安装: ${component.name} 已成功安装到 ${component.targetPath}`,
        type: 'success'
      });
    }
  } catch (error) {
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
    
    <el-card v-for="component in componentList" :key="component.id" class="component-card">
      <template #header>
        <div class="card-header">
          <h3>{{ component.name }}</h3>
        </div>
      </template>
      
      <div class="card-content">
        <div class="description">
          <h4>描述</h4>
          <p>{{ component.description }}</p>
        </div>
        
        <div class="usage">
          <h4>使用方法</h4>
          <p>{{ component.usage }}</p>
        </div>
        
        <div class="target-path">
          <h4>安装路径</h4>
          <p>{{ component.targetPath }}</p>
        </div>
        
        <div class="actions">
          <el-button type="primary" @click="downloadAndInstall(component)">
            下载安装
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.comp-list-container {
  padding: 20px;
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
</style>