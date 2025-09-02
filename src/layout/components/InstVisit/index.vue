<template>
  <div>
    <el-select
      filterable
      placeholder="请选择机构"
      class="!w-180px"
      v-model="value"
      @change="handleChange"
      clearable
    >
      <el-option v-for="item in insts" :key="item.id" :label="item.name" :value="item.id" />
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import * as InstApi from '@/api/system/inst'
import { getVisitInstId, setVisitInstId } from '@/utils/auth'
import { useMessage } from '@/hooks/web/useMessage'
import { useTagsView } from '@/hooks/web/useTagsView'

const message = useMessage() // 消息弹窗
const tagsView = useTagsView() // 标签页操作

const value = ref(getVisitInstId()) // 当前选中的机构 ID
const insts = ref<any[]>([]) // 机构列表

const handleChange = (id: number) => {
  // 设置访问机构 ID
  setVisitInstId(id)
  // 关闭其他标签页，只保留当前页
  tagsView.closeOther()
  // 刷新当前页面
  tagsView.refreshPage()
  // 提示切换成功
  const inst = insts.value.find((item) => item.id === id)
  if (inst) {
    message.success(`切换当前机构为: ${inst.name}`)
  }
}

onMounted(async () => {
  insts.value = await InstApi.getInstList()
})
</script>
