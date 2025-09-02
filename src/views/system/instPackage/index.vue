<template>

  <!-- 搜索 -->
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="套餐名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入套餐名"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-240px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['system:inst-package:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" />
          新增
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="checkedIds.length === 0"
          @click="handleDeleteBatch"
          v-hasPermi="['system:inst-package:delete']"
        >
          <Icon icon="ep:delete" class="mr-5px" />
          批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="套餐编号" align="center" prop="id" width="120" />
      <el-table-column label="套餐名" align="center" prop="name" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <div class="flex items-center justify-center">
            <!-- 按钮保持独立 -->
            <el-button
              link
              type="primary"
              @click="openForm('update', scope.row.id)"
              v-hasPermi="['system:inst-package:update']"
            >
              修改
            </el-button>
            <el-button
              link
              type="danger"
              @click="handleDelete(scope.row.id)"
              v-hasPermi="['system:inst-package:delete']"
            >
              删除
            </el-button>

            <!-- 更多操作下拉菜单 -->
            <el-dropdown
              @command="(command) => handleCommand(command, scope.row.id)"
              v-hasPermi="[
              'system:inst-package:inst-menu',
              'system:inst-package:inst-product',
              'system:inst-package:inst-table-column'
            ]"
            >
              <el-button type="primary" link>
                <Icon icon="ep:d-arrow-right" /> 更多
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <!-- 菜单权限 -->
                  <el-dropdown-item
                    command="openAssignMenuForm"
                    v-if="checkPermi(['system:inst-package:inst-menu'])"
                  >
                    <Icon icon="ep:menu" /> 菜单权限
                  </el-dropdown-item>

                  <!-- 产品权限 -->
                  <el-dropdown-item
                    command="openAssignProductForm"
                    v-if="checkPermi(['system:inst-package:inst-product'])"
                  >
                    <Icon icon="ep:goods" /> 产品权限
                  </el-dropdown-item>

                  <!-- 字段权限 -->
                  <el-dropdown-item
                    command="openAssignFieldForm"
                    v-if="checkPermi(['system:inst-package:inst-table-column'])"
                  >
                    <Icon icon="ep:document" /> 字段权限
                  </el-dropdown-item>

                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <InstPackageForm ref="formRef" @success="getList" />

  <!-- 新增权限分配弹窗 -->
  <InstPackageAssignMenuForm ref="assignMenuFormRef" />
  <InstPackageAssignProductForm ref="assignProductFormRef" />
  <InstPackageAssignFieldForm ref="assignFieldFormRef" />

</template>
<script lang="ts" setup>
import { checkPermi } from '@/utils/permission'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as InstPackageApi from '@/api/system/instPackage'
import InstPackageForm from './InstPackageForm.vue'

import InstPackageAssignMenuForm from './InstPackageAssignMenuForm.vue'
import InstPackageAssignProductForm from './InstPackageAssignProductForm.vue'
import InstPackageAssignFieldForm from './InstPackageAssignFieldForm.vue'

defineOptions({ name: 'SystemInstPackage' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  status: undefined,
  remark: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await InstPackageApi.getInstPackagePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  getList()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await InstPackageApi.deleteInstPackage(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除按钮操作 */
const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (rows: InstPackageApi.InstPackageVO[]) => {
  checkedIds.value = rows.map((row) => row.id)
}

const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起批量删除
    await InstPackageApi.deleteInstPackageList(checkedIds.value)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 处理权限分配命令 */
const handleCommand = (command: string, row: any) => {
  switch (command) {
    case 'openAssignMenuForm':
      openAssignMenuForm(row)
      break
    case 'openAssignProductForm':
      openAssignProductForm(row)
      break
    case 'openAssignFieldForm':
      openAssignFieldForm(row)
      break
    default:
      console.warn('未知命令:', command)
  }
}

/** 菜单权限操作 */
const assignMenuFormRef = ref()
const openAssignMenuForm =  (id?: number) => {
  assignMenuFormRef.value.open(id)
}

/** 产品权限操作 */
const assignProductFormRef = ref()
const openAssignProductForm = async (id?: number) => {
  assignProductFormRef.value.open(id)
}

/** 字段权限操作 */
const assignFieldFormRef = ref()
const openAssignFieldForm = async (id?: number) => {
  assignFieldFormRef.value.open(id)
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
