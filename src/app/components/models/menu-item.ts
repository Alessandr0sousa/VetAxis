export interface MenuItem {
  label: string;
  icon: string;
  routerLink?: string[];
  children?: MenuItem[];
}
