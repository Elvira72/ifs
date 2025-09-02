<template>
  <Dialog v-model="dialogVisible" title="产品权限" width="900">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" label-width="80px">
      <el-form-item label="角色名称">
        <el-tag>{{ formData.name }}</el-tag>
      </el-form-item>
      <el-form-item label="角色标识">
        <el-tag>{{ formData.code }}</el-tag>
      </el-form-item>
      <el-form-item label="产品权限">
        <el-card class="w-full" shadow="never">
          <div class="flex justify-between items-center mb-10px">
            <el-input
              v-model="searchQuery"
              clearable
              placeholder="搜索产品名称"
              size="small"
              style="width: 200px"
              @input="filterProducts"
            />
          </div>

          <!-- 产品列表表格 -->
          <el-table
            ref="productTable"
            :data="filteredProducts"
            height="400"
            size="small"
            style="width: 100%"
            v-loading="formLoading"
            row-key="id"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="45" :reserve-selection="true" />
            <el-table-column prop="code" label="产品编号" min-width="200" resizable />
            <el-table-column prop="name" label="产品名称" min-width="200" resizable />
          </el-table>
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
import { ref, reactive, nextTick } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { useMessage } from '@/hooks/web/useMessage'
import * as ProductApi from '@/api/system/product'
import * as PermissionApi from '@/api/system/permission'
import * as RoleApi from "@/api/system/role";

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const formLoading = ref(false)
const formData = reactive({
  id: '',
  name: '',
  code: '',
  productIds: []
})

// 产品相关状态
const productList = ref<any[]>([])
const filteredProducts = ref<any[]>([])
const productTable = ref()
const searchQuery = ref('')

/** 打开弹窗 */
const open = async (row: RoleApi.RoleVO) => {
  dialogVisible.value = true
  resetForm()

  // 设置角色基础数据
  formData.id = row.id
  formData.name = row.name
  formData.code = row.code

  // 统一管理加载状态
  formLoading.value = true

  try {
    await Promise.all([
      loadAllProducts(),
      loadRoleProductIds(row.id)
    ])

    nextTick(() => setSelectedProducts())
  } catch (error) {
    console.error('全局加载异常', error)
    message.error('数据加载失败')
  } finally {
    formLoading.value = false
  }
}

defineExpose({ open })

/** 加载所有产品列表 */
const loadAllProducts = async () => {
  try {
    // 调用获取所有产品列表的API
    productList.value = await ProductApi.getSimpleProductsList()
    //过滤
    filteredProducts.value = [...productList.value]
  } catch (error) {
    console.error('加载产品列表失败:', error)
    productList.value = []
    throw error
  }
}

/** 加载角色拥有的产品ID */
const loadRoleProductIds = async (roleId: number) => {
  try {
    formData.productIds = await PermissionApi.getRoleProductIds(roleId)
  } catch (error) {
    console.error('加载产品角色拥有列表失败:', error)
    formData.productIds = []
    throw error
  }
}

/** 设置选中产品 */
const setSelectedProducts = () => {
  if (formData.productIds.length > 0 && productList.value.length > 0) {
    formData.productIds.forEach(id => {
      const product = productList.value.find(p => p.id === id)
      if (product) {
        productTable.value?.toggleRowSelection(product, true)
      }
    })
  }
}

/** 过滤产品列表 */
const filterProducts = () => {
  if (!searchQuery.value) {
    filteredProducts.value = [...productList.value]
    return
  }

  const query = searchQuery.value.toLowerCase()
  filteredProducts.value = productList.value.filter(
    product => product.name && product.name.toLowerCase().includes(query)
  )
}

/** 处理选择变化 */
const handleSelectionChange = (selection: any[]) => {
  formData.productIds = selection.map(item => item.id)
}

/** 提交表单 */
const emit = defineEmits(['success'])
const submitForm = async () => {
  formLoading.value = true
  try {
    const data = {
      roleId: formData.id,
      productIds: formData.productIds
    }
    
    await PermissionApi.assignRoleProduct(data)
    message.success(t('common.updateSuccess'))
    dialogVisible.value = false
    emit('success')
  } catch (error) {
    console.error('保存产品权限失败:', error)
    message.error(t('common.updateFailed'))
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  searchQuery.value = ''
  formData.id = undefined
  formData.name = ''
  formData.code = ''
  formData.productIds = []

  if (productTable.value) {
    productTable.value.clearSelection()
  }
}
</script>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 190px;
  display: inline-block;
}
</style>
