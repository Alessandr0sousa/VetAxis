import { Component } from '@angular/core';

@Component({
  selector: 'app-card-cliente',
  imports: [],
  templateUrl: './card-cliente.html',
  styleUrl: './card-cliente.scss',
})
export class CardCliente {
  cliente = {
    nome: 'Cliente Exemplo',
    telefone: '(11) 98765-4321',
    email: 'cliente@exemplo.com',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP2g4LipcXcIbDnRL-xf2JU3GFUm6ynk6IpQ&s'
  };
}
