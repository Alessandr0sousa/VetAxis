import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnInit,
  Output,
  Renderer2
} from '@angular/core';
import { RouterModule } from '@angular/router';
import menuData from '../../../assets/menu.json';
import { CardCliente } from '../card-cliente/card-cliente';

interface MenuItem {
  label: string;
  icon: string;
  routerLink?: string[];
  children?: MenuItem[];
}

interface MenuData {
  items: MenuItem[];
}

@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [RouterModule, CommonModule, CardCliente],
  templateUrl: './menu-principal.html',
  styleUrls: ['./menu-principal.scss'],
})
export class MenuPrincipal implements OnInit {
  @Input() isCollapsed = false;
  @Output() toggle = new EventEmitter<void>();

  itens: MenuItem[] = [];

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    const typedMenu: MenuData = menuData;
    this.itens = typedMenu.items;
    this.checkScreenSize();
    this.toggleContentClass();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
    this.toggleContentClass();
  }

  private checkScreenSize() {
    // ✅ usa document.defaultView em vez de window
    const largura = this.document?.defaultView?.innerWidth ?? 1024; // fallback se estiver no SSR
    this.isCollapsed = largura < 800;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const largura = this.document?.defaultView?.innerWidth ?? 1024;
    if (largura < 800 && !this.isCollapsed) {
      if (!this.el.nativeElement.contains(event.target)) {
        this.isCollapsed = true;
      }
    }
  }

  private toggleContentClass() {
    const contentDiv = this.el.nativeElement.querySelector('.content');
    if (contentDiv) {
      if (this.isCollapsed) {
        this.renderer.addClass(contentDiv, 'collapsed');
      } else {
        this.renderer.removeClass(contentDiv, 'collapsed');
      }
    }
  }
}
