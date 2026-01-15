import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuPrincipal } from './components/menu-principal/menu-principal';
import { Navbar } from './components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuPrincipal, Navbar, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'], // ✅ corrigido
})
export class App {
  protected readonly title = signal('VetAxis');
  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
