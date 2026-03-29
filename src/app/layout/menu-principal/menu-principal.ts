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
	Renderer2,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import menuData from '../../../assets/menu.json';
import { CardCompany } from '../../components/card-cliente/card-cliente';

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
	imports: [RouterModule, CommonModule, CardCompany],
	templateUrl: './menu-principal.html',
	styleUrls: ['./menu-principal.scss'],
})
export class MenuPrincipal implements OnInit {
	@Input() isCollapsed = false;
	@Output() toggle = new EventEmitter<void>();

	itens: MenuItem[] = [];
	private expandedItems = new Set<string>();
	private expandedChildren = new Set<string>();

	constructor(
		private el: ElementRef,
		private renderer: Renderer2,
		@Inject(DOCUMENT) private document: Document,
	) {}

	ngOnInit() {
		const typedMenu: MenuData = menuData;
		this.itens = typedMenu.items;
		this.expandedItems.add('Agenda');
		this.checkScreenSize();
		this.toggleContentClass();
	}

	onParentItemClick(event: Event, item: MenuItem): void {
		this.toggleItem(item.label);

		if (!item.routerLink?.length) {
			event.preventDefault();
		}
	}

	toggleItem(label: string): void {
		if (this.expandedItems.has(label)) {
			this.expandedItems.delete(label);
			return;
		}

		this.expandedItems.add(label);
	}

	isItemExpanded(label: string): boolean {
		return this.expandedItems.has(label);
	}

	toggleChild(parentLabel: string, childLabel: string): void {
		const key = `${parentLabel}::${childLabel}`;

		if (this.expandedChildren.has(key)) {
			this.expandedChildren.delete(key);
			return;
		}

		this.expandedChildren.add(key);
	}

	isChildExpanded(parentLabel: string, childLabel: string): boolean {
		return this.expandedChildren.has(`${parentLabel}::${childLabel}`);
	}

	@HostListener('window:resize')
	onResize() {
		this.checkScreenSize();
		this.toggleContentClass();
	}

	private checkScreenSize() {
		const largura = this.document?.defaultView?.innerWidth ?? 1024;
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
