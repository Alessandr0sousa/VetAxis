import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Pet } from '../models/pet';
import { ConsultaForm } from './consulta-form/consulta-form';
import { Router } from '@angular/router';

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [ConsultaForm],
  templateUrl: './consultas.html',
  styleUrl: './consultas.scss',
})
export class Consultas implements OnInit {
  pet?: Pet | null = null;
  nome: string = '';
  isAgedamento: boolean = false;

  constructor(private cdr: ChangeDetectorRef, private router: Router, private location: Location) {}

  ngOnInit(): void {
    const state: any = this.location.getState();
    this.pet = state?.pet ?? null;
  }

  novaConsulta() {
    Swal.fire({
      title: 'Selecione um Pet para uma nova consulta!',
      icon: 'info',
      confirmButtonText: 'OK',
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/pets']);
      }
    });
  }

  onClickEmitter() {
    this.isAgedamento = true;
    this.nome = 'Agendar';
  }
}
