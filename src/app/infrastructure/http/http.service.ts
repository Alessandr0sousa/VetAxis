import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page, PageParams, SearchParams, SortParam } from '../../core/models';

/**
 * Service HTTP base com métodos comuns para comunicação com API
 * Todos os services específicos devem estender esta classe
 */
@Injectable({
  providedIn: 'root',
})
export abstract class HttpService {
  protected http = inject(HttpClient);
  protected baseUrl = environment.apiUrl;
  
  /**
   * Endpoint específico da API (ex: 'agendamentos', 'clientes')
   * Deve ser definido pelas classes filhas
   */
  protected abstract endpoint: string;

  /**
   * GET - Buscar recurso por ID
   * @param id Identificador do recurso
   */
  protected findById<T>(id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${this.endpoint}/${id}`);
  }

  /**
   * GET - Listar recursos com paginação
   * @param params Parâmetros de paginação
   */
  protected findAll<T>(params: PageParams): Observable<Page<T>> {
    const httpParams = this.buildPageParams(params);
    return this.http.get<Page<T>>(`${this.baseUrl}/${this.endpoint}`, { params: httpParams });
  }

  /**
   * GET - Buscar recursos por campo específico
   * @param params Parâmetros de busca
   */
  protected findByField<T>(params: SearchParams): Observable<Page<T>> {
    const httpParams = this.buildSearchParams(params);
    return this.http.get<Page<T>>(`${this.baseUrl}/${this.endpoint}/buscar`, { params: httpParams });
  }

  /**
   * POST - Criar novo recurso
   * @param data Dados do recurso
   * @param customEndpoint Endpoint customizado (opcional)
   */
  protected create<T, D = T>(data: D, customEndpoint?: string): Observable<T> {
    const url = customEndpoint 
      ? `${this.baseUrl}/${customEndpoint}`
      : `${this.baseUrl}/${this.endpoint}`;
    return this.http.post<T>(url, data);
  }

  /**
   * PUT - Atualizar recurso existente
   * @param id Identificador do recurso
   * @param data Dados atualizados
   * @param customEndpoint Endpoint customizado (opcional)
   */
  protected update<T, D = T>(id: number, data: D, customEndpoint?: string): Observable<T> {
    const url = customEndpoint
      ? `${this.baseUrl}/${customEndpoint}/${id}`
      : `${this.baseUrl}/${this.endpoint}/${id}`;
    return this.http.put<T>(url, data);
  }

  /**
   * PATCH - Atualizar parcialmente
   * @param id Identificador do recurso
   * @param data Dados parciais
   */
  protected patch<T>(id: number, data: Partial<T>): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${this.endpoint}/${id}`, data);
  }

  /**
   * DELETE - Remover recurso
   * @param id Identificador do recurso
   */
  protected remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.endpoint}/${id}`);
  }

  /**
   * GET genérico
   * @param path Caminho relativo
   * @param params Parâmetros opcionais
   */
  protected get<T>(path: string, params?: Record<string, any>): Observable<T> {
    const httpParams = params ? new HttpParams({ fromObject: params }) : undefined;
    return this.http.get<T>(`${this.baseUrl}/${path}`, { params: httpParams });
  }

  /**
   * POST genérico
   * @param path Caminho relativo
   * @param body Corpo da requisição
   * @param headers Headers customizados
   */
  protected post<T>(path: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${path}`, body, { headers });
  }

  /**
   * PUT genérico
   * @param path Caminho relativo
   * @param body Corpo da requisição
   */
  protected put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${path}`, body);
  }

  /**
   * DELETE genérico
   * @param path Caminho relativo
   */
  protected delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${path}`);
  }

  /**
   * Constrói HttpParams para paginação
   */
  private buildPageParams(params: PageParams): HttpParams {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString());

    if (params.sort && params.sort.length > 0) {
      params.sort.forEach((sort: SortParam) => {
        httpParams = httpParams.append('sort', `${sort.field},${sort.direction}`);
      });
    }

    return httpParams;
  }

  /**
   * Constrói HttpParams para busca
   */
  private buildSearchParams(params: SearchParams): HttpParams {
    let httpParams = this.buildPageParams(params);
    httpParams = httpParams.set('campo', params.campo).set('valor', params.valor);
    return httpParams;
  }
}
