<template>
  <div>
    <el-card shadow="never">
      <el-skeleton :loading="loading" animated>
        <el-row :gutter="16" justify="space-between">
          <el-col :xl="12" :lg="12" :md="12" :sm="24" :xs="24">
            <div class="flex items-center">
              <el-avatar :src="avatar" :size="70" class="mr-16px">
                <img src="@/assets/imgs/avatar.gif" alt="" />
              </el-avatar>
              <div>
                <div class="text-20px">
                  {{ t('workplace.welcome') }} {{ username }} {{ t('workplace.happyDay') }}
                </div>
                <div class="mt-10px text-14px text-gray-500">
                  {{ t('workplace.toady') }}，21℃ - 38℃！ 请注意防晒
                </div>
              </div>
            </div>
          </el-col>
<!--          <el-col :xl="12" :lg="12" :md="12" :sm="24" :xs="24">-->
<!--            <div class="h-70px flex items-center justify-end lt-sm:mt-10px">-->
<!--              <div class="px-8px text-right">-->
<!--                <div class="mb-16px text-14px text-gray-400">{{ t('workplace.project') }}</div>-->
<!--                <CountTo-->
<!--                  class="text-20px"-->
<!--                  :start-val="0"-->
<!--                  :end-val="totalSate.project"-->
<!--                  :duration="2600"-->
<!--                />-->
<!--              </div>-->
<!--              <el-divider direction="vertical" />-->
<!--              <div class="px-8px text-right">-->
<!--                <div class="mb-16px text-14px text-gray-400">{{ t('workplace.toDo') }}</div>-->
<!--                <CountTo-->
<!--                  class="text-20px"-->
<!--                  :start-val="0"-->
<!--                  :end-val="totalSate.todo"-->
<!--                  :duration="2600"-->
<!--                />-->
<!--              </div>-->
<!--              <el-divider direction="vertical" border-style="dashed" />-->
<!--              <div class="px-8px text-right">-->
<!--                <div class="mb-16px text-14px text-gray-400">{{ t('workplace.access') }}</div>-->
<!--                <CountTo-->
<!--                  class="text-20px"-->
<!--                  :start-val="0"-->
<!--                  :end-val="totalSate.access"-->
<!--                  :duration="2600"-->
<!--                />-->
<!--              </div>-->
<!--            </div>-->
<!--          </el-col>-->
        </el-row>
      </el-skeleton>
    </el-card>
  </div>

  <el-row class="mt-8px" :gutter="8" justify="space-between">
    <el-col :xl="16" :lg="16" :md="24" :sm="24" :xs="24" class="mb-8px">
<!--      <el-card shadow="never">-->
<!--        <template #header>-->
<!--          <div class="h-3 flex justify-between">-->
<!--            <span>{{ t('workplace.project') }}</span>-->
<!--            <el-link-->
<!--              type="primary"-->
<!--              :underline="false"-->
<!--              href="https://github.com/yudaocode"-->
<!--              target="_blank"-->
<!--            >-->
<!--              {{ t('action.more') }}-->
<!--            </el-link>-->
<!--          </div>-->
<!--        </template>-->
<!--        <el-skeleton :loading="loading" animated>-->
<!--          <el-row>-->
<!--            <el-col-->
<!--              v-for="(item, index) in projects"-->
<!--              :key="`card-${index}`"-->
<!--              :xl="8"-->
<!--              :lg="8"-->
<!--              :md="8"-->
<!--              :sm="24"-->
<!--              :xs="24"-->
<!--            >-->
<!--              <el-card-->
<!--                shadow="hover"-->
<!--                class="mr-5px mt-5px cursor-pointer"-->
<!--                @click="handleProjectClick(item.message)"-->
<!--              >-->
<!--                <div class="flex items-center">-->
<!--                  <Icon-->
<!--                    :icon="item.icon"-->
<!--                    :size="25"-->
<!--                    class="mr-8px"-->
<!--                    :style="{ color: item.color }"-->
<!--                  />-->
<!--                  <span class="text-16px">{{ item.name }}</span>-->
<!--                </div>-->
<!--                <div class="mt-12px text-12px text-gray-400">{{ t(item.message) }}</div>-->
<!--                <div class="mt-12px flex justify-between text-12px text-gray-400">-->
<!--                  <span>{{ item.personal }}</span>-->
<!--                  <span>{{ formatTime(item.time, 'yyyy-MM-dd') }}</span>-->
<!--                </div>-->
<!--              </el-card>-->
<!--            </el-col>-->
<!--          </el-row>-->
<!--        </el-skeleton>-->
<!--      </el-card>-->

      <el-card shadow="never" class="mt-8px">
        <el-skeleton :loading="loading" animated>
          <el-row :gutter="20" justify="space-between">
            <!--客户资产-->
            <el-col :xl="10" :lg="10" :md="24" :sm="24" :xs="24">
              <el-card shadow="hover" class="mb-8px">
                <el-skeleton :loading="loading" animated>
                  <Echart :options="clientOptionsData" :height="280" />
                </el-skeleton>
              </el-card>
            </el-col>

            <el-col :xl="14" :lg="14" :md="24" :sm="24" :xs="24">
              <el-card shadow="hover" class="mb-8px">
                <el-skeleton :loading="loading" animated>
                  <Echart :options="riskOptionsData" :height="280" />
                </el-skeleton>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" justify="space-between">
            <el-col :xl="10" :lg="10" :md="24" :sm="24" :xs="24">
              <el-card shadow="hover" class="mb-8px">
                <el-skeleton :loading="loading" animated>
                  <Echart :options="pieOptionsData" :height="280" />
                </el-skeleton>
              </el-card>
            </el-col>

            <el-col :xl="14" :lg="14" :md="24" :sm="24" :xs="24">
              <el-card shadow="hover" class="mb-8px">
                <el-skeleton :loading="loading" animated>
                  <Echart :options="barOptionsData" :height="280" />
                </el-skeleton>
              </el-card>
            </el-col>

          </el-row>
        </el-skeleton>
      </el-card>
    </el-col>
    <el-col :xl="8" :lg="8" :md="24" :sm="24" :xs="24" class="mb-8px">
<!--      <el-card shadow="never">-->
<!--        <template #header>-->
<!--          <div class="h-3 flex justify-between">-->
<!--            <span>{{ t('workplace.shortcutOperation') }}</span>-->
<!--          </div>-->
<!--        </template>-->
<!--        <el-skeleton :loading="loading" animated>-->
<!--          <el-row>-->
<!--            <el-col v-for="item in shortcut" :key="`team-${item.name}`" :span="8" class="mb-8px">-->
<!--              <div class="flex items-center">-->
<!--                <Icon :icon="item.icon" class="mr-8px" :style="{ color: item.color }" />-->
<!--                <el-link type="default" :underline="false" @click="handleShortcutClick(item.url)">-->
<!--                  {{ item.name }}-->
<!--                </el-link>-->
<!--              </div>-->
<!--            </el-col>-->
<!--          </el-row>-->
<!--        </el-skeleton>-->
<!--      </el-card>-->
      <el-card shadow="never" class="mt-8px">
        <template #header>
          <div class="h-3 flex justify-between">
            <span>{{ t('workplace.notice') }}</span>
            <el-link type="primary" :underline="false">{{ t('action.more') }}</el-link>
          </div>
        </template>
        <el-skeleton :loading="loading" animated>
          <div v-for="(item, index) in notice" :key="`dynamics-${index}`">
            <div class="flex items-center">
              <el-avatar :src="avatar" :size="35" class="mr-16px">
                <img src="@/assets/imgs/avatar.gif" alt="" />
              </el-avatar>
              <div>
                <div class="text-14px">
                  <Highlight :keys="item.keys.map((v) => t(v))">
                    {{ item.type }} : {{ item.title }}
                  </Highlight>
                </div>
                <div class="mt-16px text-12px text-gray-400">
                  {{ formatTime(item.date, 'yyyy-MM-dd') }}
                </div>
              </div>
            </div>
            <el-divider />
          </div>
        </el-skeleton>
      </el-card>
    </el-col>
  </el-row>
</template>
<script lang="ts" setup>
import { set } from 'lodash-es'
import { EChartsOption } from 'echarts'
import { formatTime } from '@/utils'

import { useUserStore } from '@/store/modules/user'
// import { useWatermark } from '@/hooks/web/useWatermark'
import type { WorkplaceTotal, Notice } from './types'
import {
  barOptions,
  clientAssetDistribution,
  pieOptions,
  portfolioPerformanceOptions, riskMetricsOptions
} from './echarts-data'
// import { useRouter } from 'vue-router'

defineOptions({ name: 'Index' })

const { t } = useI18n()
// const router = useRouter()
const userStore = useUserStore()
// const { setWatermark } = useWatermark()
const loading = ref(true)
const avatar = userStore.getUser.avatar
const username = userStore.getUser.nickname
// const pieOptionsData = reactive<EChartsOption>(pieOptions) as EChartsOption
const clientOptionsData = reactive<EChartsOption>(clientAssetDistribution) as EChartsOption
const pieOptionsData = reactive<EChartsOption>(portfolioPerformanceOptions) as EChartsOption
// 获取统计数
let totalSate = reactive<WorkplaceTotal>({
  project: 0,
  access: 0,
  todo: 0
})

const getCount = async () => {
  const data = {
    project: 40,
    access: 2340,
    todo: 10
  }
  totalSate = Object.assign(totalSate, data)
}

// 获取项目数
// let projects = reactive<Project[]>([])
// const getProject = async () => {
//   const data = [
//     {
//       name: 'ruoyi-vue-pro',
//       icon: 'simple-icons:springboot',
//       message: 'github.com/YunaiV/ruoyi-vue-pro',
//       personal: 'Spring Boot 单体架构',
//       time: new Date('2025-01-02'),
//       color: '#6DB33F'
//     },
//     {
//       name: 'yudao-ui-admin-vue3',
//       icon: 'ep:element-plus',
//       message: 'github.com/yudaocode/yudao-ui-admin-vue3',
//       personal: 'Vue3 + element-plus 管理后台',
//       time: new Date('2025-02-03'),
//       color: '#409EFF'
//     },
//     {
//       name: 'yudao-ui-mall-uniapp',
//       icon: 'icon-park-outline:mall-bag',
//       message: 'github.com/yudaocode/yudao-ui-mall-uniapp',
//       personal: 'Vue3 + uniapp 商城手机端',
//       time: new Date('2025-03-04'),
//       color: '#ff4d4f'
//     },
//     {
//       name: 'yudao-cloud',
//       icon: 'material-symbols:cloud-outline',
//       message: 'github.com/YunaiV/yudao-cloud',
//       personal: 'Spring Cloud 微服务架构',
//       time: new Date('2025-04-05'),
//       color: '#1890ff'
//     },
//     {
//       name: 'yudao-ui-admin-vben',
//       icon: 'devicon:antdesign',
//       message: 'github.com/yudaocode/yudao-ui-admin-vben',
//       personal: 'Vue3 + vben5(antd) 管理后台',
//       time: new Date('2025-05-06'),
//       color: '#e18525'
//     },
//     {
//       name: 'yudao-ui-admin-uniapp',
//       icon: 'ant-design:mobile',
//       message: 'github.com/yudaocode/yudao-ui-admin-uniapp',
//       personal: 'Vue3 + uniapp 管理手机端',
//       time: new Date('2025-06-01'),
//       color: '#2979ff'
//     }
//   ]
//   projects = Object.assign(projects, data)
// }

// 获取通知公告
let notice = reactive<Notice[]>([])
const getNotice = async () => {
  const data = [
    {
      title: '全面支持《企业会计准则》及财政部财报格式要求',
      type: '财务合规',
      keys: ['企业会计准则', '财报生成'],
      date: new Date(),
      description: '自动生成符合国内监管的资产负债表、利润表等标准报表'
    },
    {
      title: '对接人民银行二代支付系统（大小额支付、超级网银）',
      type: '支付清算',
      keys: ['人行支付', '超级网银'],
      date: new Date(),
      description: '支持实时到账、批量代发代扣，覆盖银行/第三方支付机构'
    },
    {
      title: '内置反洗钱（AML）监测规则，自动上报可疑交易',
      type: '风控合规',
      keys: ['反洗钱', '可疑交易'],
      date: new Date(),
      description: '符合央行《金融机构大额交易和可疑交易报告管理办法》'
    },
    {
      title: '支持银保监会EAST报送，一键生成监管数据包',
      type: '监管报送',
      keys: ['EAST报送', '银保监'],
      date: new Date(),
      description: '自动化处理1104报表、客户风险统计等监管要求'
    },
    {
      title: '国产化适配：鲲鹏/麒麟/达梦数据库全栈兼容',
      type: '技术安全',
      keys: ['国产化', '信创'],
      date: new Date(),
      description: '通过金融行业软硬件适配认证，满足信创要求'
    },
    {
      title: '已服务20+地方局，覆盖对公/报送/报表业务',
      type: '行业案例',
      keys: ['地方局', '业务'],
      date: new Date(),
      description: '系统稳定性经“双十一”级别交易高峰验证'
    }
  ]
  notice = Object.assign(notice, data)
}

// 获取快捷入口
// let shortcut = reactive<Shortcut[]>([])

// const getShortcut = async () => {
//   const data = [
//     {
//       name: '首页',
//       icon: 'ion:home-outline',
//       url: '/',
//       color: '#1fdaca'
//     },
//     {
//       name: '商城中心',
//       icon: 'ep:shop',
//       url: '/mall/home',
//       color: '#ff6b6b'
//     },
//     {
//       name: 'AI 大模型',
//       icon: 'tabler:ai',
//       url: '/ai/chat',
//       color: '#7c3aed'
//     },
//     {
//       name: 'ERP 系统',
//       icon: 'simple-icons:erpnext',
//       url: '/erp/home',
//       color: '#3fb27f'
//     },
//     {
//       name: 'CRM 系统',
//       icon: 'simple-icons:civicrm',
//       url: '/crm/backlog',
//       color: '#4daf1bc9'
//     },
//     {
//       name: 'IoT 物联网',
//       icon: 'fa-solid:hdd',
//       url: '/iot/home',
//       color: '#1a73e8'
//     }
//   ]
//   shortcut = Object.assign(shortcut, data)
// }

// 用户来源
// const getUserAccessSource = async () => {
//   const data = [
//     { value: 335, name: 'analysis.directAccess' },
//     { value: 310, name: 'analysis.mailMarketing' },
//     { value: 234, name: 'analysis.allianceAdvertising' },
//     { value: 135, name: 'analysis.videoAdvertising' },
//     { value: 1548, name: 'analysis.searchEngines' }
//   ]
//   set(
//     pieOptionsData,
//     'legend.data',
//     data.map((v) => t(v.name))
//   )
//   pieOptionsData!.series![0].data = data.map((v) => {
//     return {
//       name: t(v.name),
//       value: v.value
//     }
//   })
// }
const riskOptionsData = reactive<EChartsOption>(riskMetricsOptions) as EChartsOption
const barOptionsData = reactive<EChartsOption>(barOptions) as EChartsOption

// 日活跃量
const getDayUserActivity = async () => {
  const data = [
    { value: 13253, name: 'analysis.monday' },
    { value: 34235, name: 'analysis.tuesday' },
    { value: 26321, name: 'analysis.wednesday' },
    { value: 12340, name: 'analysis.thursday' },
    { value: 24643, name: 'analysis.friday' },
    { value: 1322, name: 'analysis.saturday' },
    { value: 1324, name: 'analysis.sunday' }
  ]
  set(
    barOptionsData,
    'xAxis.data',
    data.map((v) => t(v.name))
  )
  set(barOptionsData, 'series', [
    {
      name: t('analysis.activeQuantity'),
      data: data.map((v) => v.value),
      type: 'bar'
    }
  ])
}
// 周活跃量
const getWeeklyUserActivity = async () => {
  const data = [
    { value: 13253, name: 'analysis.monday' },
    { value: 34235, name: 'analysis.tuesday' },
    { value: 26321, name: 'analysis.wednesday' },
    { value: 12340, name: 'analysis.thursday' },
    { value: 24643, name: 'analysis.friday' },
    { value: 1322, name: 'analysis.saturday' },
    { value: 1324, name: 'analysis.sunday' }
  ]
  set(
    barOptionsData,
    'xAxis.data',
    data.map((v) => t(v.name))
  )
  set(barOptionsData, 'series', [
    {
      name: t('analysis.activeQuantity'),
      data: data.map((v) => v.value),
      type: 'bar'
    }
  ])
}

const getAllApi = async () => {
  await Promise.all([
    getCount(),
    getNotice(),
    // getShortcut(),
    // getUserAccessSource(),
    getDayUserActivity(),
    getWeeklyUserActivity()
  ])
  loading.value = false
}

// const handleProjectClick = (message: string) => {
//   window.open(`https://${message}`, '_blank')
// }

// const handleShortcutClick = (url: string) => {
//   router.push(url)
// }

getAllApi()
</script>
