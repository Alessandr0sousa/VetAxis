import { PetService } from './../../services/pet-service';
import { Component, ChangeDetectorRef, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { BaseForm } from '../../shared/base-form/base-form';
import { ConsultaModel } from '../../models/consulta-model';
import { ViaCepService } from '../../services/viacepservice';
import { Customservice } from '../../services/customservice';
import { Pet } from '../../models/pet';
import { Page } from '../../models/page';

@Component({
  selector: 'app-consulta-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consulta-form.html',
  styleUrls: ['./consulta-form.scss'],
})
export class ConsultaForm extends BaseForm<ConsultaModel> {
  pets: Pet[] = [];

  constructor(
    fb: FormBuilder,
    viaCep: ViaCepService,
    customService: Customservice,
    cdr: ChangeDetectorRef,
    location: Location,
    private petService: PetService
  ) {
    super(fb, viaCep, customService, cdr, location);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.listarPets();
  }

  protected buildForm(): void {
    this.form = this.fb.group({
      id: [null],
      agendamento: [null, Validators.required],
      peso: [null, [Validators.required, Validators.min(0)]],
      anamnese: ['', Validators.required],
      exameFisico: ['', Validators.required],
      tratamento: ['', Validators.required],
      prescricao: ['', Validators.required],
      diagnostico: ['', Validators.required],
      internamento: [false],
      pet: [null, Validators.required],
    });
  }

  listarPets(): void {
    this.petService.listar(0, 10).subscribe({
      next: (dados: Page<Pet>) => {
        this.pets = dados.content ?? [];
      },
      error: (err) => {
        console.error('Erro ao carregar pets', err);
      },
    });
  }
}
