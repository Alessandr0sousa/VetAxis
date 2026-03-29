import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pet } from '../../models/pet';
import { ClientesService } from '@features/clientes';
import { PetService } from '@features/pets';
import { UserProfileService } from '@infrastructure/storage';
import { AlertService } from '@shared/services';
import { Cliente } from '../../models/cliente';
import { Especie, Pelagem, Temperamento, getRacasPorEspecie } from '../../models/enum-model';
import { Location } from '@angular/common';

@Component({
  selector: 'app-pet-form',
  standalone: true, // importante para standalone
  imports: [ReactiveFormsModule],
  templateUrl: './pet-form.html',
  styleUrls: ['./pet-form.scss'],
})
export class PetForm implements OnInit {
  @Input() dto?: Pet;
  @Output() cancelar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<Pet>();

  petForm!: FormGroup;

  clientes: Cliente[] = [];
  clienteId?: number;

  especies = Object.values(Especie);
  pelagens = Object.values(Pelagem);
  temperamentos = Object.values(Temperamento);

  racasSelecionadas: string[] = [];

  constructor(
    private fb: FormBuilder,
    private clienteService: ClientesService,
    private userProfileService: UserProfileService,
    private alertService: AlertService,
    private petService: PetService,
    private location: Location
  ) {
    this.petForm = this.fb.group({
      nome: ['', Validators.required],
      sexo: ['', Validators.required],
      esterilizacao: [false],
      nascimento: ['', Validators.required],
      especie: ['', Validators.required],
      raca: [''],
      pelagem: [''],
      temperamento: [''],
      microchip: [false],
      chip: [],
      status: [false],
      cliente: [null, Validators.required],
      clienteNome: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.listarClientes();
  }

  ngOnChanges(): void {
    if (this.dto) {
      this.petForm.patchValue({
        ...this.dto,
        clienteNome: this.dto.cliente?.nome ?? '',
      });
    } else {
      this.petForm.reset();
    }
  }

  onEspecieChange(valor: string) {
    const especie = valor as Especie;
    this.racasSelecionadas = getRacasPorEspecie(especie);
  }

  onClienteSelecionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const nomeSelecionado = input.value;

    // procura o cliente pelo nome
    const cliente = this.clientes.find((c) => c.nome === nomeSelecionado);

    if (cliente) {
      // atualiza o form com o objeto completo
      this.petForm.patchValue({
        cliente: cliente,
      });
    }
  }

  listarClientes() {
    return this.clienteService.listar(0, 10).subscribe({
      next: (data) => (this.clientes = data.content ?? []),
      error: (err) => console.error('Erro ao carregar clientes', err),
    });
  }

  salvarPet() {
    if (this.petForm.valid) {
      // Obtém clinicaId atualizado
      const clinicaId = this.userProfileService.getClinicaId();

      // Validação essencial: clinicaId deve ser válido
      if (!this.userProfileService.isProfileValid() || clinicaId <= 0) {
        this.alertService.error('Perfil de usuário inválido. Por favor, faça login novamente.');
        return;
      }

      const formValue = this.petForm.value;
      const pet: Pet = {
        ...(this.dto ?? {}),
        ...formValue,
        clienteId: formValue.cliente?.id,
        esterilizacao: formValue.esterilizacao ?? false,
        microchip: formValue.microchip ?? false,
        status: formValue.status ?? false,
        clinicaId: clinicaId,
      };
      delete (pet as any).clienteNome;
      delete (pet as any).cliente;

      // Verifica se há observers registrados (formulário dentro do GenericList)
      const temObservers = this.salvar['observers']?.length > 0;

      if (temObservers) {
        // Formulário usado dentro do GenericList - emite evento normalmente
        this.salvar.emit(pet);
      } else {
        // Formulário standalone - salva diretamente através do serviço
        if (pet.id) {
          this.petService.atualizar(pet).subscribe({
            next: () => {
              this.alertService.success('Pet atualizado com sucesso!');
              this.location.back();
            },
            error: (err) => {
              this.alertService.error(`Erro ao atualizar pet: ${err.error?.message || err.message}`);
            },
          });
        } else {
          this.petService.salvar(pet).subscribe({
            next: () => {
              this.alertService.success('Pet cadastrado com sucesso!');
              this.location.back();
            },
            error: (err) => {
              if (err.status === 403) {
                this.alertService.error('Acesso negado. Verifique suas permissões.');
              } else if (err.status === 401) {
                this.alertService.error('Sessão expirada. Faça login novamente.');
              } else {
                this.alertService.error(`Erro ao cadastrar: ${err.error?.message || err.message}`);
              }
            },
          });
        }
      }
    }
  }

  cancelarPet() {
    this.petForm.reset();
    this.cancelar.emit();
  }
}
