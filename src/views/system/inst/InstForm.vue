<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="50%">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="机构代码" prop="instId">
        <el-input v-model="formData.instId" placeholder="请输入机构代码" />
      </el-form-item>
      <el-form-item label="机构名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入机构名称" />
      </el-form-item>
      <el-form-item label="机构套餐" prop="packageId">
        <el-select v-model="formData.packageId" clearable placeholder="请选择机构套餐">
          <el-option
            v-for="item in packageList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="联系人" prop="contactName">
        <el-input v-model="formData.contactName" placeholder="请输入联系人" />
      </el-form-item>
      <el-form-item label="联系手机" prop="contactMobile">
        <el-input v-model="formData.contactMobile" placeholder="请输入联系手机" />
      </el-form-item>
      <el-form-item v-if="formType === 'create'" label="用户名称" prop="username">
        <el-input v-model="formData.username" placeholder="请输入用户名称" />
      </el-form-item>
      <el-form-item v-if="formType === 'create'" label="用户密码" prop="password">
        <el-input
          v-model="formData.password"
          placeholder="请输入用户密码"
          show-password
          type="password"
        />
      </el-form-item>
      <el-form-item label="账号额度" prop="accountCount">
        <el-input-number
          v-model="formData.accountCount"
          :min="0"
          controls-position="right"
          placeholder="请输入账号额度"
        />
      </el-form-item>
      <el-form-item label="过期时间" prop="expireTime">
        <el-date-picker
          v-model="formData.expireTime"
          clearable
          placeholder="请选择过期时间"
          type="date"
          value-format="x"
        />
      </el-form-item>
      <el-form-item label="绑定域名" prop="website">
        <el-input v-model="formData.website" placeholder="请输入绑定域名" />
      </el-form-item>
      <el-form-item label="机构状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as InstApi from '@/api/system/inst'
import { CommonStatusEnum } from '@/utils/constants'
import * as InstPackageApi from '@/api/system/instPackage'

defineOptions({ name: 'SystemInstForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  instId: undefined,
  name: undefined,
  packageId: undefined,
  contactName: undefined,
  contactMobile: undefined,
  accountCount: undefined,
  expireTime: undefined,
  website: undefined,
  status: CommonStatusEnum.ENABLE,
  // 新增专属
  username: undefined,
  password: undefined
})
const formRules = reactive({
  instId: [{ required: true, message: '机构代码不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '机构名称不能为空', trigger: 'blur' }],
  packageId: [{ required: true, message: '机构套餐不能为空', trigger: 'blur' }],
  contactName: [{ required: true, message: '联系人不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '机构状态不能为空', trigger: 'blur' }],
  accountCount: [{ required: true, message: '账号额度不能为空', trigger: 'blur' }],
  expireTime: [{ required: true, message: '过期时间不能为空', trigger: 'blur' }],
  website: [{ required: true, message: '绑定域名不能为空', trigger: 'blur' }],
  username: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '用户密码不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const packageList = ref([] as InstPackageApi.InstPackageVO[]) // 机构套餐

/** 打开弹窗 */
const open = async (type: string, instId?: string) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (instId) {
    formLoading.value = true
    try {
      formData.value = await InstApi.getInst(instId)
    } finally {
      formLoading.value = false
    }
  }
  // 加载套餐列表
  packageList.value = await InstPackageApi.getInstPackageList()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as InstApi.InstVO
    if (formType.value === 'create') {
      await InstApi.createInst(data)
      message.success(t('common.createSuccess'))
    } else {
      await InstApi.updateInst(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    instId: undefined,
    name: undefined,
    packageId: undefined,
    contactName: undefined,
    contactMobile: undefined,
    accountCount: undefined,
    expireTime: undefined,
    website: undefined,
    status: CommonStatusEnum.ENABLE,
    username: undefined,
    password: undefined
  }
  formRef.value?.resetFields()
}
</script>
