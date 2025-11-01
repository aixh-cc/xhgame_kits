<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript); // 添加 ts 作为 typescript 的别名
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript); // 添加 js 作为 javascript 的别名

const props = defineProps<{
  code: string;
  language?: 'typescript' | 'javascript' | string;
}>()

const codeEl = ref<HTMLElement | null>(null);
const langClass = computed(() => `language-${props.language || 'typescript'}`);

const highlight = () => {
  if (codeEl.value) {
    // Reset content and class before highlighting
    codeEl.value.className = langClass.value;
    codeEl.value.textContent = props.code;
    hljs.highlightElement(codeEl.value);
  }
};

onMounted(() => {
  highlight();
});

watch(() => [props.code, props.language], () => {
  highlight();
});
</script>

<template>
  <pre class="hljs-wrap"><code ref="codeEl"></code></pre>
</template>

<style scoped>
@import 'highlight.js/styles/github-dark.css';

.hljs-wrap {
  border-radius: 6px;
  padding: 12px;
  overflow: auto;
  background: #0d1117; /* match github-dark background */
}
</style>