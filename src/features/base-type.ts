export interface ApiResponse<T> {
  data: T
  meta: {
    page: number
    pageSize: number
    total: number
  }
}
