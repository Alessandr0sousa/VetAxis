import {
  Component,
  Input,
  inject,
  signal,
  DestroyRef,
  forwardRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnexoService } from '@features/agendamentos';
import {
  AnexoModel,
  TIPOS_ANEXOS_PERMITIDOS,
  TAMANHO_MAXIMO_ANEXO,
} from '../../models/anexo-model';
import { AlertService } from '@shared/services';

@Component({
  selector: 'app-anexos-upload',
  imports: [CommonModule],
  templateUrl: './anexos-upload.html',
  styleUrls: ['./anexos-upload.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AnexosUpload),
      multi: true,
    },
  ],
})
export class AnexosUpload implements ControlValueAccessor {
  @Input() agendamentoId?: number;
  @Output() anexosTemporarios = new EventEmitter<Omit<AnexoModel, 'id'>[]>();

  private anexoService!: AnexoService;
  private alertService!: AlertService;
  private destroyRef!: DestroyRef;

  readonly anexos = signal<AnexoModel[]>([]);
  readonly anexosTemp = signal<Omit<AnexoModel, 'id'>[]>([]);
  readonly uploading = signal(false);

  private carregando = false;
  private ultimoAgendamentoCarregado?: number;

  // ControlValueAccessor
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    anexoService: AnexoService,
    alertService: AlertService,
    destroyRef: DestroyRef
  ) {
    this.anexoService = anexoService;
    this.alertService = alertService;
    this.destroyRef = destroyRef;
  }

  writeValue(value: AnexoModel[]): void {
    // Implementação do ControlValueAccessor
    // Anexos são gerenciados independentemente, não através do formulário
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Implementar se necessário
  }

  ngOnInit(): void {
    // Carrega anexos da API se há agendamentoId
    if (this.agendamentoId) {
      this.carregarAnexos();
    }
  }

  carregarAnexos(): void {
    if (!this.agendamentoId) return;

    if (this.carregando) return;
    if (this.ultimoAgendamentoCarregado === this.agendamentoId) return;

    this.carregando = true;

    this.anexoService
      .listarAnexos(this.agendamentoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (anexos) => {
          // Apenas INSERE, nunca sobrescreve (com deduplicacao por id)
          if (anexos && anexos.length > 0) {
            this.anexos.update((atual) => {
              const anexosIds = new Set(atual.map((a) => a.id));
              const novos = anexos.filter((a) => !anexosIds.has(a.id));
              return [...atual, ...novos];
            });
          }
          this.ultimoAgendamentoCarregado = this.agendamentoId;
          this.carregando = false;
        },
        error: (error) => {
          // Não mostrar erro se não encontrar anexos (404) ou se não houver anexos
          if (error.status === 404 || error.status === 204) {
          } else {
            this.alertService.error('Erro ao carregar anexos');
          }
          this.carregando = false;
        },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // Validar tipo
    if (!TIPOS_ANEXOS_PERMITIDOS.includes(file.type)) {
      this.alertService.error('Tipo de arquivo não permitido. Use PDF, PNG, JPG ou JPEG.');
      input.value = '';
      return;
    }

    // Validar tamanho
    if (file.size > TAMANHO_MAXIMO_ANEXO) {
      this.alertService.error('Arquivo muito grande. Tamanho máximo: 10MB.');
      input.value = '';
      return;
    }

    this.convertToBase64AndUpload(file);
    input.value = '';
  }

  private convertToBase64AndUpload(file: File): void {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]; // Remove o prefixo "data:...;base64,"
      this.uploadFile(file.name, file.type, file.size, base64);
    };

    reader.onerror = () => {
      this.alertService.error('Erro ao ler o arquivo');
    };

    reader.readAsDataURL(file);
  }

  private uploadFile(nome: string, tipo: string, tamanho: number, base64: string): void {
    this.uploading.set(true);

    const anexo = {
      nome,
      tipo,
      arquivo: base64,
      agendamentoId: this.agendamentoId,
    };

    // Se não tem agendamentoId, armazena temporariamente
    if (!this.agendamentoId) {
      this.anexosTemp.update((atual) => [...atual, anexo]);
      this.onChange(this.anexosTemp());
      this.onTouched();
      this.anexosTemporarios.emit(this.anexosTemp());
      this.alertService.success('Anexo adicionado! Será salvo ao criar o agendamento.');
      this.uploading.set(false);
      return;
    }

    // Se tem agendamentoId, envia para o backend
    this.anexoService
      .uploadAnexo(anexo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (anexo) => {
          this.anexos.update((atual) => [...atual, anexo]);
          this.onChange(this.anexos());
          this.onTouched();
          this.alertService.success('Anexo enviado com sucesso!');
          this.uploading.set(false);
        },
        error: () => {
          this.alertService.error('Erro ao enviar anexo');
          this.uploading.set(false);
        },
      });
  }

  async deletarAnexo(anexo: AnexoModel): Promise<void> {
    if (!anexo.id) return;
    const confirmado = await this.alertService.confirm(
      `Deseja realmente excluir ${anexo.nome}?`,
    );
    if (!confirmado) return;

    this.anexoService
      .deletarAnexo(anexo.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.anexos.update((atual) => atual.filter((a) => a.id !== anexo.id));
          this.onChange(this.anexos());
          this.onTouched();
          this.alertService.success('Anexo excluído com sucesso!');
        },
        error: () => this.alertService.error('Erro ao excluir anexo'),
      });
  }

  async deletarAnexoTemporario(index: number): Promise<void> {
    const confirmado = await this.alertService.confirm(
      'Deseja realmente excluir este anexo?',
    );
    if (!confirmado) return;

    this.anexosTemp.update((atual) => atual.filter((_, i) => i !== index));
    this.onChange(this.anexosTemp());
    this.onTouched();
    this.anexosTemporarios.emit(this.anexosTemp());
    this.alertService.success('Anexo removido!');
  }

  getTotalAnexos(): number {
    return this.anexos().length + this.anexosTemp().length;
  }

  downloadAnexo(anexo: AnexoModel): void {
    if (!anexo.id) return;

    // Se já tem o arquivo em cache, faz download direto
    if (anexo.arquivo) {
      this.anexoService.downloadAnexo(anexo);
      return;
    }

    // Busca o arquivo completo do backend
    this.uploading.set(true);
    this.anexoService
      .buscarAnexo(anexo.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (anexoCompleto) => {
          // Atualiza o anexo com o arquivo
          this.anexos.update((atual) =>
            atual.map((a) => (a.id === anexo.id ? { ...a, arquivo: anexoCompleto.arquivo } : a)),
          );
          this.anexoService.downloadAnexo(anexoCompleto);
          this.uploading.set(false);
        },
        error: () => {
          this.alertService.error('Erro ao carregar arquivo');
          this.uploading.set(false);
        },
      });
  }

  salvarAnexosTemporarios(agendamentoId: number): void {
    const temporarios = this.anexosTemp();
    if (temporarios.length === 0) return;

    this.uploading.set(true);
    this.agendamentoId = agendamentoId;

    let pendentes = temporarios.length;
    let salvosComSucesso = 0;

    temporarios.forEach((anexo) => {
      const anexoComId = { ...anexo, agendamentoId };

      this.anexoService
        .uploadAnexo(anexoComId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (anexoSalvo) => {
            this.anexos.update((atual) => [...atual, anexoSalvo]);
            salvosComSucesso++;
            pendentes--;

            if (pendentes === 0) {
              this.anexosTemp.set([]);
              this.onChange(this.anexos());
              this.onTouched();
              this.anexosTemporarios.emit([]);
              this.uploading.set(false);
              this.alertService.success(
                `${salvosComSucesso} anexo(s) salvo(s) com sucesso!`,
              );
            }
          },
          error: () => {
            pendentes--;
            if (pendentes === 0) {
              this.uploading.set(false);
              if (salvosComSucesso > 0) {
                this.anexosTemp.set([]);
                this.onChange(this.anexos());
                this.onTouched();
                this.anexosTemporarios.emit([]);
                this.alertService.warning(
                  `${salvosComSucesso} anexo(s) salvo(s), mas houve erro em alguns.`,
                );
              } else {
                this.alertService.error('Erro ao salvar anexos');
              }
            }
          },
        });
    });
  }

  private prepareDataUrl(arquivo: string, tipo: string): string | null {
    if (!arquivo) {
      console.error('Arquivo está vazio');
      return null;
    }

    // Se já tem o prefixo data:, usa como está
    if (arquivo.startsWith('data:')) {
      return arquivo;
    }

    // Verifica se o arquivo é uma string base64 válida
    const trimmed = arquivo.trim();
    if (!/^[A-Za-z0-9+/=\s]+$/.test(trimmed)) {
      return null;
    }

    // Caso contrário, adiciona o prefixo
    return `data:${tipo};base64,${trimmed}`;
  }

  visualizarAnexo(anexo: AnexoModel): void {
    if (!anexo.id) {
      this.alertService.error('Anexo inválido');
      return;
    }

    // Se já tem o arquivo em cache, abre direto
    if (anexo.arquivo) {
      this.abrirAnexo(anexo.arquivo, anexo.tipo);
      return;
    }

    // Busca o arquivo completo do backend
    this.uploading.set(true);
    this.anexoService
      .buscarAnexo(anexo.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (anexoCompleto) => {
          // Atualiza o anexo com o arquivo
          this.anexos.update((atual) =>
            atual.map((a) => (a.id === anexo.id ? { ...a, arquivo: anexoCompleto.arquivo } : a)),
          );
          this.abrirAnexo(anexoCompleto.arquivo, anexoCompleto.tipo);
          this.uploading.set(false);
        },
        error: () => {
          this.alertService.error('Erro ao carregar arquivo');
          this.uploading.set(false);
        },
      });
  }

  private abrirAnexo(arquivo: string, tipo: string): void {
    const dataUrl = this.prepareDataUrl(arquivo, tipo);
    if (!dataUrl) {
      this.alertService.error('Erro ao preparar arquivo para visualização');
      return;
    }

    try {
      window.open(dataUrl, '_blank');
    } catch (error) {
      console.error('Erro ao abrir visualizador:', error);
      this.alertService.error('Erro ao abrir arquivo');
    }
  }

  visualizarAnexoTemporario(anexo: Omit<AnexoModel, 'id'>): void {
    if (!anexo.arquivo) {
      this.alertService.error('Arquivo temporário não está disponível');
      return;
    }

    const dataUrl = this.prepareDataUrl(anexo.arquivo, anexo.tipo);
    if (!dataUrl) {
      this.alertService.error('Erro ao preparar arquivo para visualização');
      return;
    }

    try {
      window.open(dataUrl, '_blank');
    } catch (error) {
      console.error('Erro ao abrir visualizador:', error);
      this.alertService.error('Erro ao abrir arquivo');
    }
  }

  isImagem(tipo: string): boolean {
    return tipo.startsWith('image/');
  }

  getPreviewUrl(anexo: AnexoModel): string | null {
    if (!anexo.arquivo) return null;
    return this.prepareDataUrl(anexo.arquivo, anexo.tipo) || null;
  }

  getIconeAnexo(tipo: string): string {
    if (tipo === 'application/pdf') return 'fa-file-pdf';
    if (tipo.startsWith('image/')) return 'fa-file-image';
    return 'fa-file';
  }

  formatarTamanho(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
