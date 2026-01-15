import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseEntity } from '../../models/base-entity';
import { Columns } from '../../models/columns';
import { Page } from '../../models/page';
import { BaseForm } from '../../shared/base-form/base-form';

@Component({
  selector: 'app-generic-list',
  standalone: true, // Angular 20
  imports: [CommonModule, FormsModule],
  templateUrl: './generic-list.html',
  styleUrls: ['./generic-list.scss'],
})
export class GenericList<T extends BaseEntity> implements OnInit, AfterViewInit {
  @Input() service!: any;
  @Input() formComponent!: any;
  @Input() filtroFn!: (item: T, filtro: string) => boolean;
  @Input() columns: Columns<T>[] = [];
  @Input() iconAdd!: String;
  @Input() formInputName: string = 'dto';

  @Output() onEdit = new EventEmitter<any>();

  data = signal<T[]>([]);
  filtrados = signal<T[]>([]);
  formVisible = signal(false);
  selecionado = signal<T | undefined>(undefined);
  filtro: String = '';

  totalPages = signal(0);
  currentPage = signal(0);

  @ViewChild('formContainer', { read: ViewContainerRef }) formContainer!: ViewContainerRef;

  constructor(private cdr: ChangeDetectorRef, private router: Router) {}

  ngAfterViewInit() {
    if (this.formContainer) {
      this.formContainer.clear();
    }
    this.listar();
  }

  abrirForm() {
    this.formVisible.set(true);
    this.cdr.detectChanges();
    this.limparFiltro();
    this.formContainer.clear();

    const compRef = this.formContainer.createComponent(this.formComponent) as ComponentRef<
      BaseForm<T>
    >;
    compRef.setInput(this.formInputName, this.selecionado());

    setTimeout(() => {
      if (this.selecionado() && compRef.instance.form) {
        compRef.instance.form.patchValue(this.selecionado()!);
      }
    });

    compRef.instance.salvar.subscribe((item: T) => this.salvar(item));
    compRef.instance.cancelar.subscribe(() => this.fecharForm());
  }

  ngOnInit(): void {}

  listar(page: number = 0, size: number = 10) {
    this.service.listar(page, size).subscribe((dados: Page<T>) => {
      this.data.set(dados.content ?? []);
      this.filtrados.set([...this.data()]);
      this.totalPages.set(dados.totalPages);
      this.currentPage.set(dados.number);
    });
  }

  filtrar(event: string) {
    const filtro = event.toLowerCase();
    this.filtrados.set(this.data().filter((item) => this.filtroFn(item, filtro)));
  }

  limparFiltro() {
    this.filtro = '';
    this.filtrados.set(this.data()); // recarrega lista sem filtro
  }

  fecharForm() {
    this.limparFiltro();
    this.formVisible.set(false);
    this.selecionado.set(undefined);
  }

  editar(id: number) {
    this.service.buscarPorId(id).subscribe({
      next: (item: T) => {
        this.selecionado.set(item);
        this.limparFiltro();
        this.abrirForm();
      },
      error: () => alert('Erro ao buscar dados.'),
    });
  }

  consultarPet(row: any): void {
    this.service.buscarPorId(row).subscribe({
      next: (item: T) => {
        this.selecionado.set(item);
        this.router.navigate(['/consultas'], {
          state: { pet: item },
        });
      },
      error: () => alert('Erro ao buscar dados.'),
    });
  }

  salvar(item: T) {
    if (item.id) {
      this.service.atualizar(item).subscribe({
        next: () => {
          this.listar();
          this.fecharForm();
          alert('Atualizado com sucesso.');
        },
        error: () => alert('Erro ao atualizar.'),
      });
    } else {
      this.service.salvar(item).subscribe({
        next: () => {
          this.listar();
          this.fecharForm();
          alert('Salvo com sucesso.');
        },
        error: () => alert('Erro ao salvar.'),
      });
    }
    this.limparFiltro();
  }

  getValue(obj: any, path: string | keyof T | undefined): any {
    if (!path) return '';
    if (typeof path === 'string') {
      return path.split('.').reduce((acc, part) => acc?.[part], obj);
    }
    return obj[path];
  }
}
