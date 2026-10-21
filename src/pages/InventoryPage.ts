import { type Page, type Locator } from '@playwright/test';

export class InventoryPage {
    readonly page: Page;
    readonly inventoryTitle: Locator;
    readonly sortDropdown: Locator;
    readonly inventoryItems: Locator;
    readonly itemNames: Locator;
    readonly itemPrices: Locator;
    readonly cartLink: Locator;
    readonly cartBadge: Locator;
    readonly openMenuButton: Locator;
    readonly logoutLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.inventoryTitle = page.getByTestId('title');
        this.sortDropdown = page.getByTestId('product-sort-container');
        this.inventoryItems = page.getByTestId('inventory-item');
        this.itemNames = page.getByTestId('inventory-item-name');
        this.itemPrices = page.getByTestId('inventory-item-price');
        this.cartLink = page.getByTestId('shopping-cart-link');
        this.cartBadge = page.getByTestId('shopping-cart-badge');
        this.openMenuButton = page.getByTestId('open-menu');
        this.logoutLink = page.getByTestId('logout-sidebar-link');
    }

    async goto(): Promise<void> {
        await this.page.goto('https://app.thetestingacademy.com/playwright/ttacart/inventory');
    }

    async getProductNames(): Promise<string[]> {
        const names = await this.itemNames.allTextContents();
        return names.map((name) => name.trim());
    }

    async getProductPrices(): Promise<string[]> {
        const prices = await this.itemPrices.allTextContents();
        return prices.map((price) => price.trim());
    }

    async sortBy(option: string): Promise<void> {
        await this.sortDropdown.selectOption(option);
    }

    async addToCart(productSlug: string): Promise<void> {
        await this.page.getByTestId(`add-to-cart-${productSlug}`).click();
    }

    async removeFromCart(productSlug: string): Promise<void> {
        await this.page.getByTestId(`remove-${productSlug}`).click();
    }

    async openCart(): Promise<void> {
        await this.cartLink.click();
    }

    async logout(): Promise<void> {
        await this.openMenuButton.click();
        await this.logoutLink.click();
    }
}
