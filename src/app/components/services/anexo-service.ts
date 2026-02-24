import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnexoModel } from '../models/anexo-model';

@Injectable({
  providedIn: 'root',
})
export class AnexoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/anexos`;

  uploadAnexo(anexo: Omit<AnexoModel, 'id'>): Observable<AnexoModel> {
    return this.http.post<AnexoModel>(this.apiUrl, anexo);
  }

  listarAnexos(agendamentoId: number): Observable<AnexoModel[]> {
    return this.http.get<AnexoModel[]>(`${this.apiUrl}/agendamento/${agendamentoId}`);
  }

  buscarAnexo(id: number): Observable<AnexoModel> {
    return this.http.get<AnexoModel>(`${this.apiUrl}/${id}`);
  }

  deletarAnexo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  downloadAnexo(anexo: AnexoModel): void {
    if (!anexo.arquivo) {
      console.error('Anexo sem conteúdo para download');
      return;
    }

    const byteCharacters = atob(anexo.arquivo);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: anexo.tipo });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = anexo.nome;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
