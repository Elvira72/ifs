<script lang="ts" setup>
import { computed, onMounted, ref, unref, watch } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'
// 确保导入 colorIsDark 函数
import { colorIsDark } from '@/utils/color'

defineOptions({ name: 'Logo' })

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('logo')

const appStore = useAppStore()

const show = ref(true)

const title = computed(() => appStore.getTitle)

const layout = computed(() => appStore.getLayout)

const collapse = computed(() => appStore.getCollapse)

onMounted(() => {
  if (unref(collapse)) show.value = false
})

watch(
  () => collapse.value,
  (collapse: boolean) => {
    if (unref(layout) === 'topLeft' || unref(layout) === 'cutMenu') {
      show.value = true
      return
    }
    if (!collapse) {
      setTimeout(() => {
        show.value = !collapse
      }, 400)
    } else {
      show.value = !collapse
    }
  }
)

watch(
  () => layout.value,
  (layout) => {
    if (layout === 'top' || layout === 'cutMenu') {
      show.value = true
    } else {
      if (unref(collapse)) {
        show.value = false
      } else {
        show.value = true
      }
    }
  }
)

// 计算是否是深色背景
const isDarkTheme = computed(() => {
  const bgColor = appStore.getTheme.leftMenuBgColor || '#ffffff' // 默认白色
  return colorIsDark(bgColor)
})

const isDarkHeader = computed(() => {
  const bgColor = appStore.getTheme.topHeaderBgColor || '#ffffff' // 默认白色
  return colorIsDark(bgColor)
})

</script>

<template>
  <div>
    <router-link
      :class="[
        prefixCls,
        layout !== 'classic' ? `${prefixCls}__Top` : '',
        'flex !h-[var(--logo-height)] items-center cursor-pointer pl-8px relative decoration-none overflow-hidden'
      ]"
      to="/"
    >
      <!--首页展示logo图标-->
      <img
        class="h-[calc(var(--logo-height)*1)] w-[calc(var(--logo-height)*1)]"
        src="@/assets/imgs/logo.png"
      />
      <div
        v-if="show"
        :class="[
          'ml-10px text-16px font-700',
          {
            'text-white': (layout === 'classic' && isDarkTheme) ||
                        ((layout === 'topLeft' || layout === 'top' || layout === 'cutMenu') && isDarkHeader),
            'text-[#000]': (layout === 'classic' && !isDarkTheme) ||
                         ((layout === 'topLeft' || layout === 'top' || layout === 'cutMenu') && !isDarkHeader)
          }
        ]"
      >
        {{ title }}
      </div>
    </router-link>
  </div>
</template>
