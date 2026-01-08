import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../api-services/api-sevice';
import { Pet } from '../models/pet';
import { Page } from '../models/page';

@Injectable({ providedIn: 'root' })
export class PetService extends ApiService {
  private endpoint = 'pets';

  constructor(http: HttpClient) {
    super(http);
  }

  listar(page: number = 0, size: number = 10): Observable<Page<Pet>> {
    return this.get<Page<Pet>>(`${this.endpoint}?page=${page}&size=${size}`);
  }

  getPetById(id: number): Observable<Pet> {
    return this.get<Pet>(`${this.endpoint}/${id}`);
  }

  salvar(pet: Pet): Observable<Pet> {
    console.log('Salvando pet no serviço:', pet);
    return this.post<Pet>(this.endpoint, pet);
  }

  atualizar(pet: Pet): Observable<Pet> {
    return this.put<Pet>(`${this.endpoint}/${pet.id}`, pet);
  }

  deletePet(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
