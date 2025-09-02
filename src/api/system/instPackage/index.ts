import request from '@/config/axios'
import {InstVO} from "@/api/system/inst";

export interface InstPackageVO {
  id: number
  name: string
  status: number
  remark: string
  creator: string
  updater: string
  updateTime: string
  menuIds: number[]
  insts: InstVO[]
  crossInstIds: string[]
  createTime: Date
  updateMode: number
}

// 查询机构套餐列表
export const getInstPackagePage = (params: PageParam) => {
  return request.get({ url: '/system/inst-package/page', params })
}

// 获得机构
export const getInstPackage = (params: { id: number; updateMode: number }) => {
  return request.get({
    url: '/system/inst-package/get',
    params: {
      id: params.id,
      updateMode: params.updateMode
    }
  })
}
// 新增机构套餐
export const createInstPackage = (data: InstPackageVO) => {
  return request.post({ url: '/system/inst-package/create', data })
}

// 修改机构套餐
export const updateInstPackage = (data: InstPackageVO) => {
  return request.put({ url: '/system/inst-package/update', data })
}

// 删除机构套餐
export const deleteInstPackage = (id: number) => {
  return request.delete({ url: '/system/inst-package/delete?id=' + id })
}

// 批量删除机构套餐
export const deleteInstPackageList = (ids: number[]) => {
  return request.delete({ url: '/system/inst-package/delete-list', params: { ids: ids.join(',') } })
}

// 获取机构套餐精简信息列表
export const getInstPackageList = () => {
  return request.get({ url: '/system/inst-package/simple-list' })
}
