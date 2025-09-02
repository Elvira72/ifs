import request from '@/config/axios'

export interface InstVO {
  instId: string
  name: string
  contactName: string
  contactMobile: string
  status: number
  domain: string
  packageId: number
  username: string
  password: string
  expireTime: Date
  accountCount: number
  createTime: Date
}

export interface InstPageReqVO extends PageParam {
  name?: string
  contactName?: string
  contactMobile?: string
  status?: number
  createTime?: Date[]
}

export interface InstExportReqVO {
  name?: string
  contactName?: string
  contactMobile?: string
  status?: number
  createTime?: Date[]
}

// 查询机构列表
export const getInstPage = (params: InstPageReqVO) => {
  return request.get({ url: '/system/inst/page', params })
}

// 查询机构详情
export const getInst = (instId: string) => {
  return request.get({ url: '/system/inst/get?instId=' + instId })
}

// 获取机构精简信息列表
export const getInstList = () => {
  return request.get({ url: '/system/inst/simple-list' })
}

// 新增机构
export const createInst = (data: InstVO) => {
  return request.post({ url: '/system/inst/create', data })
}

// 修改机构
export const updateInst = (data: InstVO) => {
  return request.put({ url: '/system/inst/update', data })
}

// 删除机构
export const deleteInst = (instId: string) => {
  return request.delete({ url: '/system/inst/delete?instId=' + instId })
}

// 批量删除机构
export const deleteInstList = (instIds: string[]) => {
  return request.delete({ url: '/system/inst/delete-list', params: { instIds: instIds.join(',') } })
}

// 导出机构
export const exportInst = (params: InstExportReqVO) => {
  return request.download({ url: '/system/inst/export-excel', params })
}
