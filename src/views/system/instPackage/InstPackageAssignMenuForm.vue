<template>
  <Dialog v-model="dialogVisible" title="机构套餐菜单权限">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" label-width="80px">
      <el-form-item label="套餐名">
        <el-tag>{{ formData.name }}</el-tag>
      </el-form-item>
      <el-form-item label="套餐编号">
        <el-tag>{{ formData.id }}</el-tag>
      </el-form-item>
      <el-form-item label="菜单权限">
        <el-card class="w-full h-400px !overflow-y-scroll" shadow="never">
          <template #header>
            全选/全不选:
            <el-switch
              v-model="treeNodeAll"
              active-text="是"
              inactive-text="否"
              inline-prompt
              @change="handleCheckedTreeNodeAll"
            />
            全部展开/折叠:
            <el-switch
              v-model="menuExpand"
              active-text="展开"
              inactive-text="折叠"
              inline-prompt
              @change="handleCheckedTreeExpand"
            />
          </template>
          <el-tree
            ref="treeRef"
            :data="menuOptions"
            :props="defaultProps"
            empty-text="加载中，请稍候"
            node-key="id"
            show-checkbox
          />
        </el-card>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { defaultProps, handleTree } from '@/utils/tree'
import * as MenuApi from '@/api/system/menu'
import * as InstPackageApi from "@/api/system/instPackage";
import {ElTree} from "element-plus";
import {SystemupdateModeEnum} from "@/utils/constants";

defineOptions({ name: 'SystemRoleAssignMenuForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
  id: undefined,
  name: '',
  code: '',
  menuIds: [],
  crossInstIds: [] // 存储机构权限ID
})
const formRef = ref() // 表单 Ref
const menuOptions = ref<any[]>([]) // 菜单树形结构
const menuExpand = ref(false) // 展开/折叠
const treeRef = ref<InstanceType<typeof ElTree>>() // 树组件 Ref
const treeNodeAll = ref(false) // 全选/全不选

/** 打开弹窗 */
const open = async (id?: number) => {
  dialogVisible.value = true
  resetForm()

  // 加载菜单列表
  const menus = await MenuApi.getSimpleMenusList()

  let insts: any[] = []
  let crossInstIds: string[] = []
  let menuIds: number[] = []

  // 获取机构数据
  try {
    formLoading.value = true
    const res = await InstPackageApi.getInstPackage({
      id: id || 0,
      updateMode: SystemupdateModeEnum.MENU
    })

    insts = res.insts || []
    crossInstIds = res.crossInstIds || []
    menuIds = res.menuIds || []

    // 设置表单数据
    formData.value = {
      ...res,
      crossInstIds: crossInstIds
    }
  } catch (error) {
    console.error('获取机构数据失败:', error)
    insts = []
    crossInstIds = []
    menuIds = []
  } finally {
    formLoading.value = false
  }

  // 创建机构节点 - 每个机构作为一个独立节点，parentId设置为5010(跨机构查询菜单ID)
  const instNodes = insts.map(inst => ({
    id: `inst_${inst.instId}`, // 使用唯一ID，添加inst_前缀避免与菜单ID冲突
    name: inst.name,
    parentId: 5010, // 跨机构查询菜单项的ID
    type: 4, // 自定义类型，表示机构节点
    isInst: true // 标记为机构节点，便于后续处理
  }))

  // 将机构节点添加到菜单数组中
  const allNodes = [...menus, ...instNodes]

  // 使用handleTree构建树形结构
  menuOptions.value = handleTree(allNodes)

  // 设置默认选中的菜单项
  nextTick(() => {
    menuIds.forEach((menuId: number) => {
      treeRef.value!.setChecked(menuId, true, false)
    })

    // 设置默认选中的机构项
    crossInstIds.forEach(instId => {
      treeRef.value!.setChecked(`inst_${instId}`, true, false)
    })
  })
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    // 获取所有选中的节点键（不包括半选节点）
    const checkedKeys = treeRef.value!.getCheckedKeys(false) as (number | string)[]
    // 获取半选节点键（通常是父菜单）
    const halfCheckedKeys = treeRef.value!.getHalfCheckedKeys() as (number | string)[]

    // 过滤出菜单ID（数字ID或不是以inst_开头的字符串）
    const menuCheckedKeys = checkedKeys.filter(key =>
      typeof key === 'number' || (typeof key === 'string' && !key.startsWith('inst_'))
    )

    // 过滤出机构ID（以inst_开头的字符串）
    const instCheckedKeys = checkedKeys
      .filter(key => typeof key === 'string' && key.startsWith('inst_'))
      .map(key => key.toString().replace('inst_', ''))

    // 合并菜单ID：选中的和半选的（半选通常是父菜单）
    const allMenuKeys = [
      ...menuCheckedKeys,
      ...halfCheckedKeys.filter(key =>
        typeof key === 'number' || (typeof key === 'string' && !key.startsWith('inst_'))
      )
    ]

    // 准备提交数据
    const data = {
      ...formData.value,
      updateMode: SystemupdateModeEnum.MENU,
      menuIds: allMenuKeys,
      crossInstIds: instCheckedKeys
    } as unknown as InstPackageApi.InstPackageVO

    await InstPackageApi.updateInstPackage(data)
    message.success(t('common.updateSuccess'))
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } catch (error) {
    console.error('提交失败:', error)
    message.error(t('common.updateFailed'))
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  // 重置选项
  treeNodeAll.value = false
  menuExpand.value = false
  // 重置表单
  formData.value = {
    id: undefined,
    name: '',
    code: '',
    menuIds: [],
    crossInstIds: []
  }
  treeRef.value?.setCheckedNodes([])
  formRef.value?.resetFields()
}

/** 全选/全不选 */
const handleCheckedTreeNodeAll = () => {
  if (treeNodeAll.value) {
    treeRef.value!.setCheckedNodes(menuOptions.value)
  } else {
    treeRef.value!.setCheckedNodes([])
  }
}

/** 展开/折叠全部 */
const handleCheckedTreeExpand = () => {
  const nodes = treeRef.value!.store.nodesMap
  for (let node in nodes) {
    nodes[node].expanded = menuExpand.value
  }
}
</script>
