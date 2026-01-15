import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuItem } from '../models/menu-item';

@Injectable({
  providedIn: 'root',
})
@Injectable({ providedIn: 'root' })
export class MenuService {
  constructor(private http: HttpClient) {}

  getMenu(): Observable<{ items: MenuItem[] }> {
    return this.http.get<{ items: MenuItem[] }>('assets/menu.json');
  }
}
