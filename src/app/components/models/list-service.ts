import { Observable } from "rxjs";

export interface ListService {
  listar(page: number, size: number): Observable<any>;
}
