import request from '@/config/axios'

export interface ProductVO {
  id: number
  code: string
  name: string
  sort: number
  parentId: number
  createTime: Date
}

// 查询产品（精简）列表
export const getSimpleProductsList = () => {
  return request.get({ url: '/system/product/simple-list'})
}

// 查询菜单列表
export const getProductList = (params) => {
  return request.get({ url: '/system/product/list', params })
}

// 获取菜单详情
export const getProduct = (id: number) => {
  return request.get({ url: '/system/product/get?id=' + id })
}

// 新增菜单
export const createProduct = (data: ProductVO) => {
  return request.post({ url: '/system/product/create', data })
}

// 修改菜单
export const updateProduct = (data: ProductVO) => {
  return request.put({ url: '/system/product/update', data })
}

// 删除菜单
export const deleteProduct = (id: number) => {
  return request.delete({ url: '/system/product/delete?id=' + id })
}
