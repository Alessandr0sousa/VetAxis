export interface Columns<T> {
  header: string;
  field?: keyof T | string | ((row: T) => any);
  actions?: ColumnAction<T>[];
}

export interface ColumnAction<T> {
  icon: string;
  title: string;
  callback: any;
  class: string;
  type?: 'edit' | 'consultar' | string; // opcional
}

