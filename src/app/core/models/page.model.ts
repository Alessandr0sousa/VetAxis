/**
 * Interface genérica para resposta paginada do backend
 */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Interface para parâmetros de paginação
 */
export interface PageParams {
  page: number;
  size: number;
  sort?: SortParam[];
}

/**
 * Interface para parâmetros de ordenação
 */
export interface SortParam {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Interface para busca por campo
 */
export interface SearchParams extends PageParams {
  campo: string;
  valor: string;
}
