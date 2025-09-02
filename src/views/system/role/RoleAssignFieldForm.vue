<template>
  <Dialog v-model="dialogVisible" title="字段权限" width="1200px">
    <el-form ref="formRef" :model="formData" label-width="80px">
      <!-- 角色信息 -->
      <el-form-item label="角色名称">
        <el-tag>{{ formData.name }}</el-tag>
      </el-form-item>
      <el-form-item label="角色标识">
        <el-tag>{{ formData.code }}</el-tag>
      </el-form-item>

      <!-- 字段权限区域 - 双列布局 -->
      <el-form-item label="字段权限">
        <el-card class="w-full" shadow="never">
          <div class="flex gap-4 h-550px">
            <!-- 左侧表列表 -->
            <div class="w-1/2 border-r pr-4">
              <el-card class="w-full h-full" shadow="never">
                <el-input
                  v-model="tableSearchQuery"
                  placeholder="搜索表名称"
                  clearable
                  size="small"
                  class="mb-3"
                />
                <div class="overflow-y-auto" style="height: 480px">
                  <el-table
                    ref="tableTableRef"
                    :data="filteredTables"
                    size="small"
                    height="480"
                    row-key="id"
                    @selection-change="handleTableSelectionChange"
                    @row-click="handleTableRowClick"
                    @select="handleTableSelect"
                  >
                    <el-table-column
                      type="selection"
                      width="55"
                      align="center"
                      :reserve-selection="true"
                    />
                    <el-table-column label="表编号" prop="code" min-width="240">
                      <template #default="{ row }">
                        <span class="font-mono text-sm">{{ row.code }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="表名称" prop="name" min-width="200" />
                  </el-table>
                </div>
              </el-card>
            </div>

            <!-- 右侧字段列表（树形结构） -->
            <div class="w-1/2">
              <el-card class="w-full h-full !overflow-y-scroll" shadow="never">
                <template #header>
                  <div class="flex justify-between items-center">
                    <div>
                      <span v-if="currentTable" class="font-medium mr-4">
                        字段列表 - {{ currentTable.name }}
                      </span>
                      <span v-else class="text-gray-500">请选择表</span>
                    </div>
                    <div class="flex space-x-2">
                      <el-tooltip content="全选/全不选" placement="top">
                        <el-switch
                          v-model="fieldTreeNodeAll"
                          active-text="全选"
                          inactive-text="全不选"
                          inline-prompt
                          @change="handleFieldTreeNodeAll"
                        />
                      </el-tooltip>
                      <el-tooltip content="展开/折叠" placement="top">
                        <el-switch
                          v-model="fieldExpand"
                          active-text="展开"
                          inactive-text="折叠"
                          inline-prompt
                          @change="handleFieldTreeExpand"
                        />
                      </el-tooltip>
                    </div>
                  </div>
                </template>

                <div v-if="currentTable">
                  <el-input
                    v-model="fieldSearchQuery"
                    placeholder="搜索字段名称或分组名称"
                    clearable
                    size="small"
                    class="mb-3"
                  />

                  <el-tree
                    v-loading="fieldLoading"
                    ref="fieldTreeRef"
                    :data="filteredFieldTreeData"
                    :props="fieldTreeProps"
                    :default-expand-all="fieldExpand"
                    node-key="id"
                    show-checkbox
                    class="field-tree"
                    @check="handleFieldTreeCheck"
                  />
                </div>
                <div v-else class="h-full flex items-center justify-center text-gray-400">
                  请从左侧选择一张表以查看字段
                </div>
              </el-card>
            </div>
          </div>
        </el-card>
      </el-form-item>
    </el-form>

    <!-- 底部按钮 -->
    <template #footer>
      <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import type { ElTree, ElTable } from 'element-plus'
import { ElMessage } from 'element-plus'
import * as RoleApi from "@/api/system/role";
import * as TableColumnApi from "@/api/system/tableColumn";
import * as PermissionApi from '@/api/system/permission'

// 对话框状态
const dialogVisible = ref(false)
const roleId = ref(0) // 当前角色ID
const submitLoading = ref(false) // 提交加载状态
const fieldLoading = ref(false) // 字段加载状态

// 表单数据
const formData = reactive({
  id: undefined,
  name: '',
  code: '',
  tableColumnIdMap: {} as Record<number, number[]> // {表ID: [字段ID数组]}
})

// 表数据
const tables = ref<PermissionApi.PermissionAssignRoleTableReqVO[]>([])

// 字段树形数据缓存（按表ID）
const fieldTreeCache = ref<Record<string, any[]>>({})

// 所有字段ID缓存（按表ID）
const allFieldIdsCache = ref<Record<number, number[]>>({})

// 当前显示的字段树
const fieldTreeData = ref<any[]>([])

// 当前选中的表
const currentTable = ref<PermissionApi.PermissionAssignRoleTableReqVO | null>(null)

// 树形控件引用
const fieldTreeRef = ref<InstanceType<typeof ElTree> | null>(null)

// 表格控件引用
const tableTableRef = ref<InstanceType<typeof ElTable> | null>(null)

// 选中的表ID列表
const selectedTableIds = ref<number[]>([])

// 全选/展开控制
const fieldTreeNodeAll = ref(true) // 默认全选状态
const fieldExpand = ref(true)

// 搜索条件
const tableSearchQuery = ref('')
const fieldSearchQuery = ref('')

// 树形结构配置
const fieldTreeProps = {
  label: 'name',
  children: 'children'
}

// 过滤后的表列表
const filteredTables = computed(() => {
  if (!tableSearchQuery.value) return tables.value
  const query = tableSearchQuery.value.toLowerCase()
  return tables.value.filter(
    table => table.name.toLowerCase().includes(query) ||
      table.code.toLowerCase().includes(query)
  )
})

// 修复字段树搜索逻辑
const filteredFieldTreeData = computed(() => {
  if (!currentTable.value || !fieldTreeData.value.length) return [];

  const query = fieldSearchQuery.value.trim().toLowerCase();
  if (!query) return fieldTreeData.value;

  // 递归搜索匹配的节点
  const findMatchingNodes = (nodes: any[]): any[] => {
    return nodes.filter(node => {
      const nodeName = node.name.toLowerCase();
      const isMatch = nodeName.includes(query);

      // 处理分组节点
      if (node.children) {
        // 1. 分组名称匹配：保留整个分组及其所有子节点
        if (isMatch) {
          return true;
        }

        // 2. 分组名称不匹配：检查子节点
        const matchingChildren = findMatchingNodes(node.children);
        return matchingChildren.length > 0;
      }

      // 3. 处理字段节点
      return isMatch;
    });
  };

  // 创建过滤后的树结构
  const createFilteredTree = (nodes: any[]): any[] => {
    return nodes.map(node => {
      // 深拷贝节点
      const clonedNode = JSON.parse(JSON.stringify(node));

      if (clonedNode.children) {
        if (query) {
          // 如果是分组节点匹配
          if (clonedNode.name.toLowerCase().includes(query)) {
            // 保留所有子字段（不进行过滤）
            clonedNode.children = createFilteredTree(clonedNode.children);
          } else {
            // 只保留匹配的子字段
            clonedNode.children = createFilteredTree(clonedNode.children).filter(
              child => child.name.toLowerCase().includes(query)
            );
          }
        } else {
          // 没有搜索条件时保留所有子节点
          clonedNode.children = createFilteredTree(clonedNode.children);
        }
      }

      return clonedNode;
    });
  };

  // 第一步：确定保留哪些节点
  const filteredNodes = findMatchingNodes([...fieldTreeData.value]);

  // 第二步：构建过滤后的树结构
  return createFilteredTree(filteredNodes);
});

// 处理表格行选中事件（复选框点击）
const handleTableSelect = (selection: any[], row: PermissionApi.PermissionAssignRoleTableReqVO) => {
  // 如果该行被选中，则加载该表字段
  if (selection.some(item => item.id === row.id)) {
    handleTableRowClick(row)
  }
}

// 处理表选择变化
const handleTableSelectionChange = (selection: any[]) => {
  // 更新选中表ID列表
  selectedTableIds.value = selection.map(table => table.id)

  // 处理新增选中的表：自动全选字段
  selection.forEach(table => {
    if (!formData.tableColumnIdMap[table.id] || formData.tableColumnIdMap[table.id].length === 0) {
      // 如果字段已加载，立即全选
      if (allFieldIdsCache.value[table.id]) {
        formData.tableColumnIdMap[table.id] = [...allFieldIdsCache.value[table.id]]
      } else {
        // 如果字段未加载，标记为需要全选
        formData.tableColumnIdMap[table.id] = []
      }
    }

    // 如果当前显示的是该表，更新字段树
    if (currentTable.value?.id === table.id) {
      applyFieldSelection(table.id)
    }
  })

  // 处理取消选中的表：清空该表的权限
  tables.value.forEach(table => {
    if (!selectedTableIds.value.includes(table.id)) {
      // 如果当前显示的是该表，更新字段树
      if (currentTable.value?.id === table.id) {
        applyFieldSelection(table.id)
      }
    }
  })

  // 新增：自动加载第一个选中表的字段
  // if (selection.length > 0 && !currentTable.value) {
  //   handleTableRowClick(selection[0])
  // }
}

// 应用字段选择状态
const applyFieldSelection = (tableId: number) => {
  if (fieldTreeRef.value) {
    fieldTreeRef.value.setCheckedKeys(formData.tableColumnIdMap[tableId] || [])
    updateTreeNodeAllState()
  }
}

// 点击表行加载字段
const handleTableRowClick = async (row: PermissionApi.PermissionAssignRoleTableReqVO) => {
  // 如果点击的是当前表且已加载过，无需重新加载
  if (currentTable.value?.id === row.id && fieldTreeCache.value[row.id]) {
    return;
  }

  // 保存当前表的状态（如果有）
  saveCurrentTableState()

  // 设置当前表
  currentTable.value = row
  fieldSearchQuery.value = ''

  // 确保权限已初始化
  if (!formData.tableColumnIdMap[row.id]) {
    formData.tableColumnIdMap[row.id] = []
  }

  // 如果字段树已缓存，直接使用
  if (fieldTreeCache.value[row.id]) {
    fieldTreeData.value = fieldTreeCache.value[row.id]
    applyFieldSelection(row.id)
    return
  }

  // 加载字段数据
  fieldLoading.value = true
  try {
    const response = await TableColumnApi.getFieldGroups(row.id)
    const fieldTree = transformFieldGroupsToTree(response)
    fieldTreeCache.value[row.id] = fieldTree
    fieldTreeData.value = fieldTree

    // 缓存所有字段ID
    const allLeafKeys = getAllLeafKeys(fieldTree)
    allFieldIdsCache.value[row.id] = allLeafKeys

    // 如果表已被选中，但还没有权限设置，则设置为全选
    if (selectedTableIds.value.includes(row.id) &&
      formData.tableColumnIdMap[row.id].length === 0) {
      formData.tableColumnIdMap[row.id] = [...allLeafKeys]
    }

    nextTick(() => {
      applyFieldSelection(row.id)
      expandAllNodes(true)
    })
  } catch (error) {
    console.error('加载字段分组失败', error)
    ElMessage.error('加载字段分组失败')
  } finally {
    fieldLoading.value = false
  }
}

// 保存当前表的状态（仅保存数据，不再处理UI更新）
const saveCurrentTableState = () => {
  if (!currentTable.value || !fieldTreeRef.value) return

  const tableId = currentTable.value.id
  const checkedKeys = fieldTreeRef.value.getCheckedKeys()

  // 只保存字段节点（忽略分组节点）
  const leafKeys = checkedKeys.filter(key => {
    const node = findNodeById(fieldTreeData.value, Number(key))
    return node?.type === 'field'
  })

  // 更新权限数据
  formData.tableColumnIdMap[tableId] = leafKeys as number[]
}

// 更新表格选中状态UI
const updateTableSelectionUI = (tableId: number, selected: boolean) => {
  nextTick(() => {
    const tableRow = tables.value.find(t => t.id === tableId)
    if (tableRow && tableTableRef.value) {
      tableTableRef.value.toggleRowSelection(tableRow, selected)
    }
  })
}

// 转换字段分组为树形结构
const transformFieldGroupsToTree = (groups: any): any[] => {
  if (Array.isArray(groups)) {
    return groups.map(group => ({
      id: group.groupCode,
      name: group.groupName,
      type: 'group',
      children: group.columns.map((field: any) => ({
        id: field.id,
        name: field.name,
        type: 'field'
      }))
    }))
  }

  if (groups && groups.data && Array.isArray(groups.data)) {
    return groups.data.map((group: any) => ({
      id: group.id,
      name: group.name,
      type: 'group',
      children: group.columns.map((field: any) => ({
        id: field.id,
        name: field.name,
        type: 'field'
      }))
    }))
  }

  console.error('无法解析字段分组数据:', groups)
  return []
}

// 更新全选状态
const updateTreeNodeAllState = () => {
  if (!currentTable.value) return

  const allLeafKeys = getAllLeafKeys(fieldTreeData.value)
  const checkedLeafKeys = formData.tableColumnIdMap[currentTable.value.id] || []

  fieldTreeNodeAll.value = allLeafKeys.length > 0 && allLeafKeys.every(key => checkedLeafKeys.includes(key))
}

// 核心修改：实时更新左侧表选择状态
const updateTableSelectionImmediately = (tableId: number) => {
  // 检查该表是否有选中的字段
  const hasSelectedFields = formData.tableColumnIdMap[tableId] && formData.tableColumnIdMap[tableId].length > 0;

  // 检查当前是否已选中该表
  const isSelected = selectedTableIds.value.includes(tableId);

  if (hasSelectedFields && !isSelected) {
    // 需要选中但未选中：添加选中状态
    selectedTableIds.value.push(tableId);
    updateTableSelectionUI(tableId, true);
  } else if (!hasSelectedFields && isSelected) {
    // 不需要选中但已选中：移除选中状态
    const index = selectedTableIds.value.indexOf(tableId);
    if (index !== -1) {
      selectedTableIds.value.splice(index, 1);
      updateTableSelectionUI(tableId, false);
    }
  }
}

// 处理树节点勾选变化（核心修改点）
const handleFieldTreeCheck = (data: any, { checkedKeys }: { checkedKeys: number[] }) => {
  if (!currentTable.value) return

  // 保存叶子节点
  const leafKeys = checkedKeys.filter(key => {
    const node = findNodeById(fieldTreeData.value, key)
    return node?.type === 'field'
  })

  // 更新当前表的权限
  formData.tableColumnIdMap[currentTable.value.id] = leafKeys

  // 立即更新左侧表选择状态
  updateTableSelectionImmediately(currentTable.value.id)

  // 更新全选状态
  updateTreeNodeAllState()
}

// 查找树节点
const findNodeById = (nodes: any[], id: number): any | null => {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

// 全选/全不选处理
const handleFieldTreeNodeAll = () => {
  if (!fieldTreeRef.value || !currentTable.value) return

  if (fieldTreeNodeAll.value) {
    const leafKeys = getAllLeafKeys(fieldTreeData.value)
    fieldTreeRef.value.setCheckedKeys(leafKeys)
    formData.tableColumnIdMap[currentTable.value.id] = leafKeys

    // 核心修改：立即更新左侧表选择状态
    updateTableSelectionImmediately(currentTable.value.id)
  } else {
    fieldTreeRef.value.setCheckedKeys([])
    formData.tableColumnIdMap[currentTable.value.id] = []

    // 核心修改：立即更新左侧表选择状态
    updateTableSelectionImmediately(currentTable.value.id)
  }
}

// 展开/折叠处理
const handleFieldTreeExpand = () => {
  expandAllNodes(fieldExpand.value)
}

// 递归获取所有叶子节点key
const getAllLeafKeys = (nodes: any[]): number[] => {
  let keys: number[] = []
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      keys = keys.concat(getAllLeafKeys(node.children))
    } else if (node.type === 'field') {
      keys.push(node.id)
    }
  }
  return keys
}

// 展开/折叠所有节点
const expandAllNodes = (expand: boolean) => {
  if (!fieldTreeRef.value) return
  const nodesMap = fieldTreeRef.value.store.nodesMap
  for (const key in nodesMap) {
    nodesMap[key].expanded = expand
  }
}

// 打开对话框
const open = async (row: RoleApi.RoleVO) => {
  dialogVisible.value = true
  roleId.value = row.id
  formData.name = row.name
  formData.code = row.code

  // 重置状态
  currentTable.value = null
  tableSearchQuery.value = ''
  fieldSearchQuery.value = ''
  fieldTreeData.value = []
  fieldTreeCache.value = {}
  allFieldIdsCache.value = {}
  formData.tableColumnIdMap = {}
  selectedTableIds.value = []
  fieldTreeNodeAll.value = true
  fieldExpand.value = true

  try {
    // 1. 加载所有表
    const tablesResponse = await TableColumnApi.listAllTables()

    if (Array.isArray(tablesResponse)) {
      tables.value = tablesResponse
    } else if (tablesResponse?.data && Array.isArray(tablesResponse.data)) {
      tables.value = tablesResponse.data
    } else {
      console.error('表列表数据结构不正确:', tablesResponse)
      tables.value = []
    }

    // 2. 加载角色已有字段权限
    const tableColumnIdMapResponse = await PermissionApi.getRoleTablesColumns(row.id)

    // 处理权限数据
    if (typeof tableColumnIdMapResponse === 'object' && tableColumnIdMapResponse !== null) {
      formData.tableColumnIdMap = tableColumnIdMapResponse.data || tableColumnIdMapResponse
    } else {
      formData.tableColumnIdMap = {}
    }

    // 3. 初始化选中的表：有权限的表
    selectedTableIds.value = []
    for (const tableId in formData.tableColumnIdMap) {
      if (formData.tableColumnIdMap[tableId] && formData.tableColumnIdMap[tableId].length > 0) {
        selectedTableIds.value.push(Number(tableId))
      }
    }

    // 4. 设置表格选中状态
    nextTick(() => {
      if (tableTableRef.value) {
        // 清除之前的选择
        tableTableRef.value.clearSelection()

        // 创建选中ID集合
        const selectedIdSet = new Set(selectedTableIds.value.map(id => String(id)))

        // 遍历所有表格行
        tables.value.forEach(table => {
          const tableIdStr = String(table.id)
          if (selectedIdSet.has(tableIdStr)) {
            // 确保找到表格行对象
            const row = tables.value.find(t => String(t.id) === tableIdStr)
            if (row) {
              tableTableRef.value?.toggleRowSelection(row, true)
            }
          }
        })
      }
    })
  } catch (error) {
    console.error('加载权限数据失败', error)
    ElMessage.error('加载权限数据失败')
  }
}

// 提交表单
const submitForm = async () => {


  submitLoading.value = true
  try {
    // 保存当前正在查看的表状态
    if (currentTable.value) {
      saveCurrentTableState()
    }

    // 处理所有选中但未加载字段的表
    const unloadedTables = selectedTableIds.value.filter(tableId =>
      !fieldTreeCache.value[tableId]
    );

    for (const tableId of unloadedTables) {
      try {
        const response = await TableColumnApi.getFieldGroups(tableId);
        const fieldTree = transformFieldGroupsToTree(response);
        const allFieldIds = getAllLeafKeys(fieldTree);

        // 如果该表有选中字段，但还没有权限数据，则使用选中字段
        if (!formData.tableColumnIdMap[tableId] || formData.tableColumnIdMap[tableId].length === 0) {
          formData.tableColumnIdMap[tableId] = [...allFieldIds];
        }

        fieldTreeCache.value[tableId] = fieldTree;
        allFieldIdsCache.value[tableId] = allFieldIds;
      } catch (error) {
        console.error(`加载表${tableId}字段分组失败`, error);
      }
    }

    const tableColumnIdMapToSave: Record<number, number[]> = {}
    selectedTableIds.value.forEach(tableId => {
      if (formData.tableColumnIdMap[tableId]) {
        tableColumnIdMapToSave[tableId] = formData.tableColumnIdMap[tableId]
      }
    })

    await PermissionApi.assignRoleTableColumn({
      roleId: roleId.value,
      tableColumnIdMap: tableColumnIdMapToSave
    })

    ElMessage.success('字段权限保存成功')
    dialogVisible.value = false
  } catch (error) {
    console.error('保存失败', error)
    ElMessage.error('保存字段权限失败')
  } finally {
    submitLoading.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.field-tree {
  max-height: 380px;
  overflow-y: auto;
}

:deep(.el-table--small .el-table__cell) {
  padding: 6px 0;
}

:deep(.el-table__body-wrapper) {
  max-height: 430px;
  overflow-y: auto;
}

.font-mono {
  font-family: 'Courier New', monospace;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
  cursor: pointer;
}

:deep(.el-table__row.current-row) {
  background-color: #ecf5ff;
}

.border-r {
  border-right: 1px solid #ebeef5;
}

:deep(.el-tree-node__content) {
  height: 36px;
}

:deep(.el-tree-node__label) {
  font-size: 14px;
}
</style>
