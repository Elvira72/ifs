<script lang="ts" setup>
import { ElMessage, ElDrawer, ElDivider, ElButton } from 'element-plus'
import { useClipboard, useCssVar } from '@vueuse/core'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import { useDesign } from '@/hooks/web/useDesign'
import { setCssVar, trim } from '@/utils'
import { colorIsDark, hexToRGB, lighten } from '@/utils/color'
import { useAppStore } from '@/store/modules/app'
import { ThemeSwitch } from '@/layout/components/ThemeSwitch'
import ColorRadioPicker from './components/ColorRadioPicker.vue'
import InterfaceDisplay from './components/InterfaceDisplay.vue'
import LayoutRadioPicker from './components/LayoutRadioPicker.vue'

defineOptions({ name: 'Setting' })

const { t } = useI18n()
const appStore = useAppStore()
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('setting')
const layout = computed(() => appStore.getLayout)
const drawer = ref(false)

/* 改进后的拖动逻辑 - 自由拖动但自动吸附右侧且限制垂直边界 */
const dragButton = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const startLeft = ref(0)
const startTop = ref(0)
const isCollapsed = ref(false)
const hasDragged = ref(false)
const DRAG_THRESHOLD = 5 // 拖动阈值（像素）

const EDGE_THRESHOLD = 50 // 吸附阈值
const COLLAPSE_WIDTH = 10 // 缩小后的宽度
const ANIMATION_DURATION = 200 // 动画持续时间(ms)

let animationFrameId: number | null = null
let resizeTimeout: number | null = null

// 安全设置样式函数
const safeSetStyle = (element: HTMLElement | null, styles: Record<string, string>) => {
  if (!element) return
  Object.entries(styles).forEach(([key, value]) => {
    element.style[key as any] = value
  })
}

// 优化后的窗口大小变化处理
const handleResize = () => {
  if (!dragButton.value) return

  // 使用防抖但设置更短的时间（50ms）
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }

  resizeTimeout = setTimeout(() => {
    const rect = dragButton.value!.getBoundingClientRect()
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    // 实时计算新位置
    let newLeft = Math.min(rect.left, windowWidth - COLLAPSE_WIDTH)
    let newTop = Math.min(rect.top, windowHeight - 40)

    newTop = Math.max(0, newTop)
    newLeft = Math.max(0, newLeft)

    // 实时检查是否需要吸附到右侧
    const shouldAttachRight = windowWidth - rect.left - 40 < EDGE_THRESHOLD ||
      windowWidth > rect.left + 100

    if (shouldAttachRight) {
      newLeft = windowWidth - COLLAPSE_WIDTH
      if (!isDragging.value) {
        collapseButton()
      }
    }

    // 使用更流畅的动画
    safeSetStyle(dragButton.value, {
      transition: `left ${ANIMATION_DURATION}ms ease, top ${ANIMATION_DURATION}ms ease`,
      left: `${newLeft}px`,
      top: `${newTop}px`
    })
  }, 50) as unknown as number
}

// 开始拖动
const startDrag = (e: MouseEvent) => {
  if (!dragButton.value) return

  isDragging.value = true
  hasDragged.value = false
  startX.value = e.clientX
  startY.value = e.clientY

  const rect = dragButton.value.getBoundingClientRect()
  startLeft.value = rect.left
  startTop.value = rect.top

  // 拖动前先恢复原始大小
  safeSetStyle(dragButton.value, {
    width: '40px',
    borderRadius: '6px',
    transition: 'none'
  })
  isCollapsed.value = false

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

// 拖动中处理
const onDrag = (e: MouseEvent) => {
  if (!isDragging.value || !dragButton.value) return

  const dx = Math.abs(e.clientX - startX.value)
  const dy = Math.abs(e.clientY - startY.value)

  // 只有当移动距离超过阈值时才认为是拖动
  if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
    hasDragged.value = true
  }

  if (animationFrameId) cancelAnimationFrame(animationFrameId)

  animationFrameId = requestAnimationFrame(() => {
    const dx = e.clientX - startX.value
    const dy = e.clientY - startY.value

    // 计算新位置
    let newLeft = startLeft.value + dx
    let newTop = startTop.value + dy

    // 限制边界
    newTop = Math.max(0, Math.min(newTop, window.innerHeight - 40))
    newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - 40))

    // 直接设置位置，无过渡效果
    safeSetStyle(dragButton.value, {
      transition: 'none',
      left: `${newLeft}px`,
      top: `${newTop}px`
    })
  })
}

// 停止拖动处理
const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  // 立即处理位置
  handleResize()
}

// 缩小按钮
const collapseButton = () => {
  if (!dragButton.value) return

  isCollapsed.value = true
  safeSetStyle(dragButton.value, {
    width: `${COLLAPSE_WIDTH}px`,
    borderRadius: '6px 0 0 6px'
  })
}

// 鼠标悬停展开
const handleMouseEnter = () => {
  if (!dragButton.value || !isCollapsed.value) return

  safeSetStyle(dragButton.value, {
    transition: `all ${ANIMATION_DURATION}ms ease`,
    width: '40px',
    borderRadius: '6px',
    left: `${window.innerWidth - 40}px`
  })
  isCollapsed.value = false
}

// 鼠标离开恢复缩小
const handleMouseLeave = () => {
  if (!dragButton.value || isDragging.value || isCollapsed.value) return

  // 立即处理位置
  handleResize()
}

// 点击事件处理
const handleClick = () => {
  if (!hasDragged.value) {
    drawer.value = true
  }
  hasDragged.value = false
}

onMounted(() => {
  if (!dragButton.value) return

  // 初始位置在右侧中间
  safeSetStyle(dragButton.value, {
    position: 'fixed',
    left: `${window.innerWidth - COLLAPSE_WIDTH}px`,
    top: '45%',
    zIndex: '4001',
    transition: `all ${ANIMATION_DURATION}ms ease`
  })
  collapseButton()

  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('resize', handleResize)
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (resizeTimeout) clearTimeout(resizeTimeout)
})

/* 主题设置逻辑 */
// 主题色相关
const systemTheme = ref(appStore.getTheme.elColorPrimary)

// 头部主题相关
const headerTheme = ref(appStore.getTheme.topHeaderBgColor || '')

// 菜单主题相关
const menuTheme = ref(appStore.getTheme.leftMenuBgColor || '')

const setSystemTheme = (color: string) => {
  setCssVar('--el-color-primary', color)
  appStore.setTheme({ elColorPrimary: color })
  const leftMenuBgColor = useCssVar('--left-menu-bg-color', document.documentElement)
  setMenuTheme(trim(unref(leftMenuBgColor)))
}

const setHeaderTheme = (color: string) => {
  const isDarkColor = colorIsDark(color)
  const textColor = isDarkColor ? '#fff' : 'inherit'
  const textHoverColor = isDarkColor ? lighten(color!, 6) : '#f6f6f6'
  const topToolBorderColor = isDarkColor ? color : '#eee'
  setCssVar('--top-header-bg-color', color)
  setCssVar('--top-header-text-color', textColor)
  setCssVar('--top-header-hover-color', textHoverColor)
  appStore.setTheme({
    topHeaderBgColor: color,
    topHeaderTextColor: textColor,
    topHeaderHoverColor: textHoverColor,
    topToolBorderColor
  })
  if (unref(layout) === 'top') {
    setMenuTheme(color)
  }
}

const setMenuTheme = (color: string) => {
  const primaryColor = useCssVar('--el-color-primary', document.documentElement)
  const isDarkColor = colorIsDark(color)
  const theme: Recordable = {
    // 左侧菜单边框颜色
    leftMenuBorderColor: isDarkColor ? 'inherit' : '#eee',
    // 左侧菜单背景颜色
    leftMenuBgColor: color,
    // 左侧菜单浅色背景颜色
    leftMenuBgLightColor: isDarkColor ? lighten(color!, 6) : color,
    // 左侧菜单选中背景颜色
    leftMenuBgActiveColor: isDarkColor ? 'var(--el-color-primary)' : hexToRGB(unref(primaryColor), 0.1),
    // 左侧菜单收起选中背景颜色
    leftMenuCollapseBgActiveColor: isDarkColor ? 'var(--el-color-primary)' : hexToRGB(unref(primaryColor), 0.1),
    // 左侧菜单字体颜色
    leftMenuTextColor : isDarkColor ? '#bfcbd9' : '#333',
    // 左侧菜单选中字体颜色
    leftMenuTextActiveColor: isDarkColor ? '#fff' : 'var(--el-color-primary)',
    // logo字体颜色
    logoTitleTextColor : isDarkColor ? '#fff' : 'inherit',
    // logo边框颜色
    logoBorderColor : isDarkColor ? color : '#eee'
  }
  appStore.setTheme(theme)
  appStore.setCssVarTheme()
}

if (layout.value === 'top' && !appStore.getIsDark) {
  headerTheme.value = '#fff'
  setHeaderTheme('#fff')
}

// 监听layout变化，重置一些主题色
watch(
  () => layout.value,
  (n) => {
    if (n === 'top' && !appStore.getIsDark) {
      headerTheme.value = '#fff'
      setHeaderTheme('#fff')
    } else {
      setMenuTheme(unref(menuTheme))
    }
  }
)

// 拷贝
const copyConfig = async () => {
  const { copy, copied, isSupported } = useClipboard({
    source: `
      // 面包屑
      breadcrumb: ${appStore.getBreadcrumb},
      // 面包屑图标
      breadcrumbIcon: ${appStore.getBreadcrumbIcon},
      // 折叠图标
      hamburger: ${appStore.getHamburger},
      // 全屏图标
      screenfull: ${appStore.getScreenfull},
      // 尺寸图标
      size: ${appStore.getSize},
      // 多语言图标
      locale: ${appStore.getLocale},
      // 消息图标
      message: ${appStore.getMessage},
      // 标签页
      tagsView: ${appStore.getTagsView},
      // 标签页
      tagsViewImmerse: ${appStore.getTagsViewImmerse},
      // 标签页图标
      tagsViewIcon: ${appStore.getTagsViewIcon},
      // logo
      logo: ${appStore.getLogo},
      // 菜单手风琴
      uniqueOpened: ${appStore.getUniqueOpened},
      // 固定header
      fixedHeader: ${appStore.getFixedHeader},
      // 页脚
      footer: ${appStore.getFooter},
      // 灰色模式
      greyMode: ${appStore.getGreyMode},
      // layout布局
      layout: '${appStore.getLayout}',
      // 暗黑模式
      isDark: ${appStore.getIsDark},
      // 组件尺寸
      currentSize: '${appStore.getCurrentSize}',
      // 主题相关
      theme: {
        // 主题色
        elColorPrimary: '${appStore.getTheme.elColorPrimary}',
        // 左侧菜单边框颜色
        leftMenuBorderColor: '${appStore.getTheme.leftMenuBorderColor}',
        // 左侧菜单背景颜色
        leftMenuBgColor: '${appStore.getTheme.leftMenuBgColor}',
        // 左侧菜单浅色背景颜色
        leftMenuBgLightColor: '${appStore.getTheme.leftMenuBgLightColor}',
        // 左侧菜单选中背景颜色
        leftMenuBgActiveColor: '${appStore.getTheme.leftMenuBgActiveColor}',
        // 左侧菜单收起选中背景颜色
        leftMenuCollapseBgActiveColor: '${appStore.getTheme.leftMenuCollapseBgActiveColor}',
        // 左侧菜单字体颜色
        leftMenuTextColor: '${appStore.getTheme.leftMenuTextColor}',
        // 左侧菜单选中字体颜色
        leftMenuTextActiveColor: '${appStore.getTheme.leftMenuTextActiveColor}',
        // logo字体颜色
        logoTitleTextColor: '${appStore.getTheme.logoTitleTextColor}',
        // logo边框颜色
        logoBorderColor: '${appStore.getTheme.logoBorderColor}',
        // 头部背景颜色
        topHeaderBgColor: '${appStore.getTheme.topHeaderBgColor}',
        // 头部字体颜色
        topHeaderTextColor: '${appStore.getTheme.topHeaderTextColor}',
        // 头部悬停颜色
        topHeaderHoverColor: '${appStore.getTheme.topHeaderHoverColor}',
        // 头部边框颜色
        topToolBorderColor: '${appStore.getTheme.topToolBorderColor}'
      }
    `
  })
  if (!isSupported) {
    ElMessage.error(t('setting.copyFailed'))
  } else {
    await copy()
    if (unref(copied)) {
      ElMessage.success(t('setting.copySuccess'))
    }
  }
}

// 清空缓存
const clear = () => {
  const { wsCache } = useCache()
  wsCache.delete(CACHE_KEY.LAYOUT)
  wsCache.delete(CACHE_KEY.THEME)
  wsCache.delete(CACHE_KEY.IS_DARK)
  window.location.reload()
}
</script>

<template>
  <div
    ref="dragButton"
    :class="[
      prefixCls,
      isCollapsed ? 'collapsed' : '',
      isDragging ? 'dragging' : ''
    ]"
    class="drag-btn"
    @mousedown="startDrag"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <Icon v-show="!isCollapsed" color="#fff" icon="ep:setting" />
  </div>

  <ElDrawer v-model="drawer" :z-index="4000" direction="rtl" size="350px">
    <template #header>
      <span class="text-16px font-700">{{ t('setting.projectSetting') }}</span>
    </template>

    <div class="text-center">
      <!-- 主题 -->
      <ElDivider>{{ t('setting.theme') }}</ElDivider>
      <ThemeSwitch />

      <!-- 布局 -->
      <ElDivider>{{ t('setting.layout') }}</ElDivider>
      <LayoutRadioPicker />

      <!-- 系统主题 -->
      <ElDivider>{{ t('setting.systemTheme') }}</ElDivider>
      <ColorRadioPicker
        v-model="systemTheme"
        :schema="[
          '#409eff',
          '#009688',
          '#536dfe',
          '#ff5c93',
          '#ee4f12',
          '#0096c7',
          '#9c27b0',
          '#ff9800'
        ]"
        @change="setSystemTheme"
      />

      <!-- 头部主题 -->
      <ElDivider>{{ t('setting.headerTheme') }}</ElDivider>
      <ColorRadioPicker
        v-model="headerTheme"
        :schema="[
          '#fff',
          '#151515',
          '#5172dc',
          '#e74c3c',
          '#24292e',
          '#394664',
          '#009688',
          '#383f45'
        ]"
        @change="setHeaderTheme"
      />

      <!-- 菜单主题 -->
      <template v-if="layout !== 'top'">
        <ElDivider>{{ t('setting.menuTheme') }}</ElDivider>
        <ColorRadioPicker
          v-model="menuTheme"
          :schema="[
            '#fff',
            '#001529',
            '#212121',
            '#273352',
            '#191b24',
            '#383f45',
            '#001628',
            '#344058'
          ]"
          @change="setMenuTheme"
        />
      </template>

      <!-- 界面显示 -->
      <ElDivider>{{ t('setting.interfaceDisplay') }}</ElDivider>
      <InterfaceDisplay />

      <ElDivider />
      <div>
        <ElButton class="w-full" type="primary" @click="copyConfig">{{ t('setting.copy') }}</ElButton>
      </div>
      <div class="mt-5px">
        <ElButton class="w-full" type="danger" @click="clear">
          {{ t('setting.clearAndReset') }}
        </ElButton>
      </div>
    </div>
  </ElDrawer>
</template>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-setting;

.drag-btn {
  position: fixed;
  width: 40px;
  height: 40px;
  background: var(--el-color-primary);
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4001;
  user-select: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 6px;

  &.dragging {
    cursor: grabbing;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }

  &.collapsed {
    width: 10px;
    opacity: 0.8;
    border-radius: 6px 0 0 6px;

    &:hover {
      opacity: 1;
    }
  }
}

.#{$prefix-cls} {
  /*修正没有z-index会被表格层覆盖,值不要超过4000*/
  z-index: 1200;
}
</style>
