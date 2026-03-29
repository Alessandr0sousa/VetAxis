import { EventEmitter } from '@angular/core';

export interface BaseForm<T> {
  salvar: EventEmitter<T>;
  cancelar: EventEmitter<void>;
}

