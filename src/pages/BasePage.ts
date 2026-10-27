import { type Locator, type Page } from '@playwright/test';
import { createLogger, type Logger } from '../utils/logger';
import { UtilElementLocator } from '../utils/UtilElementLocator';

export const BASE_URL = 'https://app.thetestingacademy.com/playwright/ttacart';

export class BasePage {
    readonly page: Page;
    readonly logger: Logger;
    readonly util: UtilElementLocator;

    readonly title: Locator;
    readonly primaryHeader: Locator;
    readonly openMenuButton: Locator;
    readonly closeMenuButton: Locator;
    readonly sideMenu: Locator;
    readonly cartLink: Locator;
    readonly cartBadge: Locator;
    readonly inventorySidebarLink: Locator;
    readonly aboutSidebarLink: Locator;
    readonly logoutLink: Locator;
    readonly resetLink: Locator;
    readonly footer: Locator;

    constructor(page: Page) {
        this.page = page;
        this.logger = createLogger(this.constructor.name);
        this.util = new UtilElementLocator(page, undefined, this.logger);

        this.title = this.util.byTestId('title');
        this.primaryHeader = this.util.byTestId('primary-header');
        this.openMenuButton = this.util.byTestId('open-menu');
        this.closeMenuButton = this.util.byTestId('close-menu');
        this.sideMenu = this.util.byTestId('side-menu');
        this.cartLink = this.util.byTestId('shopping-cart-link');
        this.cartBadge = this.util.byTestId('shopping-cart-badge');
        this.inventorySidebarLink = this.util.byTestId('inventory-sidebar-link');
        this.aboutSidebarLink = this.util.byTestId('about-sidebar-link');
        this.logoutLink = this.util.byTestId('logout-sidebar-link');
        this.resetLink = this.util.byTestId('reset-sidebar-link');
        this.footer = this.util.byTestId('footer');
    }

    protected url(path: string): string {
        return `${BASE_URL}${path}`;
    }

    async goto(path = '/'): Promise<void> {
        await this.page.goto(this.url(path));
    }

    async heading(): Promise<string> {
        return this.util.text(this.title);
    }

    async cartCount(): Promise<number> {
        return this.util.count(this.cartBadge);
    }

    async openMenu(): Promise<void> {
        await this.util.click(this.openMenuButton);
    }

    async closeMenu(): Promise<void> {
        await this.util.click(this.closeMenuButton);
    }

    async openCart(): Promise<void> {
        await this.util.click(this.cartLink);
    }

    async logout(): Promise<void> {
        await this.openMenu();
        await this.util.click(this.logoutLink);
    }

    async resetAppState(): Promise<void> {
        await this.openMenu();
        await this.util.click(this.resetLink);
    }
}

export default BasePage;
