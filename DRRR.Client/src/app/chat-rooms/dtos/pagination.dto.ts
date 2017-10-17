/**
 * 分页信息DTO
 */
export interface PaginationDto {
  /**
   * 当前页码
   */
  currentPage: number;

  /**
   * 总页数
   */
  totalPages: number;

  /**
   * 总项目数
   */
  totalItems: number;
}
