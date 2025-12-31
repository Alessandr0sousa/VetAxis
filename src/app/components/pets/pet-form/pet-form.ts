import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Pet } from '../../models/pet';

@Component({
  selector: 'app-pet-form',
  imports: [ReactiveFormsModule],
  templateUrl: './pet-form.html',
  styleUrl: './pet-form.scss',
})
export class PetForm implements OnInit {
  @Input() petId?: number;
  @Output() cancelar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<void>();

  petForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
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
      status: [false],
      clienteId: [null, Validators.required]
    });

    if (this.petId) {
      const pet: Pet = {
        id: this.petId,
        nome: 'Rex',
        sexo: 'Macho',
        esterilizacao: true,
        nascimento: '2020-05-10',
        especie: 'Cão',
        raca: 'Labrador',
        pelagem: 'Amarela',
        status: true,
        temperamento: 'Amigável',
        microchip: true,
        clienteId: 1
      };
      this.petForm.patchValue(pet);
    }
  }

  salvarPet() {
    if (this.petForm.valid) {
      console.log('Pet salvo:', this.petForm.value);
      this.salvar.emit();
    }
  }

  cancelarPet() {
    this.petForm.reset();
    this.cancelar.emit();
  }
}
