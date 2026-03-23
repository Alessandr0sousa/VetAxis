/**
 * Entidade base para todos os modelos do sistema
 * Fornece identificação única e nome comum
 */
export interface BaseEntity {
  id: number;
  nome: string;
}

/**
 * Entidade base para criação (sem ID)
 */
export type CreateBaseEntity = Omit<BaseEntity, 'id'>;

/**
 * Entidade base para atualização (ID obrigatório)
 */
export type UpdateBaseEntity = BaseEntity;
