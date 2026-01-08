import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pet } from '../../models/pet';
import { ClientesService } from '../../services/clientes-service';
import { Cliente } from '../../models/cliente';
import { Especie, Pelagem, Temperamento, getRacasPorEspecie } from '../../models/enum-model';

@Component({
  selector: 'app-pet-form',
  standalone: true, // importante para standalone
  imports: [ReactiveFormsModule],
  templateUrl: './pet-form.html',
  styleUrls: ['./pet-form.scss'],
})
export class PetForm implements OnInit {
  @Input() pet?: Pet;
  @Output() cancelar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<Pet>();

  petForm!: FormGroup;

  clientes: Cliente[] = [];
  clienteId?: number;

  especies = Object.values(Especie);
  pelagens = Object.values(Pelagem);
  temperamentos = Object.values(Temperamento);

  racasSelecionadas: string[] = [];

  constructor(private fb: FormBuilder, private clienteService: ClientesService) {
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
    if (this.pet) {
      this.petForm.patchValue({
        ...this.pet,
        clienteNome: this.pet.cliente?.nome ?? '',
      });
    } else {
      this.petForm.reset();
    }
  }

  onEspecieChange(valor: string) {
  const especie = valor as Especie;
  this.racasSelecionadas = getRacasPorEspecie(especie);
}


  listarClientes() {
    return this.clienteService.listar(0, 10).subscribe({
      next: (data) => (this.clientes = data.content ?? []),
      error: (err) => console.error('Erro ao carregar clientes', err),
    });
  }

  salvarPet() {
    if (this.petForm.valid) {
      const formValue = this.petForm.value;
      const pet: Pet = {
        ...(this.pet ?? {}),
        ...formValue,
        cliente: formValue.cliente, // objeto completo
      };
      delete (pet as any).clienteNome;
      this.salvar.emit(pet);
    }
  }

  cancelarPet() {
    this.petForm.reset();
    this.cancelar.emit();
  }
}
