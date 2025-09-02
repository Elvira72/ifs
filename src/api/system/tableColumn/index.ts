import request from '@/config/axios'

export interface TableColumnVO {
  id: number
  code: string
  name: string
  sort: number
  parentId: number
  createTime: Date
}

// 查询表（精简）列表
export const listAllTables = async () => {
  return await request.get({ url: '/system/table/simple-list' })
}

// 获取表的字段分组
export const getFieldGroups = async (tableId: number) => {
  return await request.get({ url: '/system/column/group-simple-list', params: { tableId } })
}

// 查询表列表
export const getTableColumnList = (params) => {
  return request.get({ url: '/system/TableColumn/list', params })
}

// 获取表详情
export const getTableColumn = (id: number) => {
  return request.get({ url: '/system/TableColumn/get?id=' + id })
}

// 新增表
export const createTableColumn = (data: TableColumnVO) => {
  return request.post({ url: '/system/TableColumn/create', data })
}

// 修改表
export const updateTableColumn = (data: TableColumnVO) => {
  return request.put({ url: '/system/TableColumn/update', data })
}

// 删除表
export const deleteTableColumn = (id: number) => {
  return request.delete({ url: '/system/TableColumn/delete?id=' + id })
}
