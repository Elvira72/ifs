import request from '@/config/axios'

export interface PermissionAssignUserRoleReqVO {
  userId: number
  roleIds: number[]
}

export interface PermissionAssignRoleMenuReqVO {
  roleId: number
  menuIds: number[]
}

export interface PermissionAssignRoleDataScopeReqVO {
  roleId: number
  dataScope: number
  dataScopeDeptIds: number[]
}

export interface PermissionAssignRoleProductReqVO {
  roleId: number
  productIds: string[]
}

export interface PermissionAssignRoleTableReqVO {
  id: number,
  code: string,
  name: string
}

export interface PermissionAssignRoleFieldReqVO {
  id: string
  name: string
}

export interface PermissionAssignRoleFieldGroupReqVO {
  id: string
  name: string
  columns: PermissionAssignRoleFieldReqVO[]
}

// 查询角色拥有的菜单权限
export const getRoleMenuList = async (roleId: number) => {
  return await request.get({ url: '/system/permission/list-role-menus?roleId=' + roleId })
}

// 赋予角色菜单权限
export const assignRoleMenu = async (data: PermissionAssignRoleMenuReqVO) => {
  return await request.post({ url: '/system/permission/assign-role-menu', data })
}

// 赋予角色数据权限
export const assignRoleDataScope = async (data: PermissionAssignRoleDataScopeReqVO) => {
  return await request.post({ url: '/system/permission/assign-role-data-scope', data })
}

// 获取角色拥有的产品ID
export const getRoleProductIds = async (roleId: number) => {
  return await request.get({ url: '/system/permission/list-role-products?roleId=' + roleId })
}

// 赋予角色产品权限
export const assignRoleProduct = async (data: PermissionAssignRoleProductReqVO) => {
  return await request.post({ url: '/system/permission/assign-role-product', data })
}

// 查询角色拥有的表/字段权限
export const getRoleTablesColumns = async (roleId: number) => {
  return await request.get({ url: '/system/permission/list-role-tables-columns?roleId=' + roleId })
}

// 保存角色字段权限
export const assignRoleTableColumn = async (data: {
  roleId: number
  tableColumnIdMap: Record<number, number[]>
}) => {
  return await request.post({ url: '/system/permission/assign-role-table-column', data })
}


// 查询用户拥有的角色数组
export const getUserRoleList = async (userId: number) => {
  return await request.get({ url: '/system/permission/list-user-roles?userId=' + userId })
}

// 赋予用户角色
export const assignUserRole = async (data: PermissionAssignUserRoleReqVO) => {
  return await request.post({ url: '/system/permission/assign-user-role', data })
}
