import { type Page, type Locator } from '@playwright/test';

export class CartPage {
    readonly page: Page;
    readonly cartTitle: Locator;
    readonly cartRows: Locator;
    readonly itemNames: Locator;
    readonly itemPrices: Locator;
    readonly itemQuantities: Locator;
    readonly emptyMessage: Locator;
    readonly continueShoppingButton: Locator;
    readonly checkoutButton: Locator;
    readonly cartBadge: Locator;

    constructor(page: Page) {
        this.page = page;
        this.cartTitle = page.getByTestId('title');
        this.cartRows = page.getByTestId('inventory-item');
        this.itemNames = page.getByTestId('inventory-item-name');
        this.itemPrices = page.getByTestId('inventory-item-price');
        this.itemQuantities = page.getByTestId('item-quantity');
        this.emptyMessage = page.getByTestId('cart-empty');
        this.continueShoppingButton = page.getByTestId('continue-shopping');
        this.checkoutButton = page.getByTestId('checkout');
        this.cartBadge = page.getByTestId('shopping-cart-badge');
    }

    async goto(): Promise<void> {
        await this.page.goto('https://app.thetestingacademy.com/playwright/ttacart/cart');
    }

    async getItemNames(): Promise<string[]> {
        const names = await this.itemNames.allTextContents();
        return names.map((name) => name.trim());
    }

    async getItemPrices(): Promise<string[]> {
        const prices = await this.itemPrices.allTextContents();
        return prices.map((price) => price.trim());
    }

    async getItemQuantities(): Promise<string[]> {
        const quantities = await this.itemQuantities.allTextContents();
        return quantities.map((quantity) => quantity.trim());
    }

    async removeItem(productSlug: string): Promise<void> {
        await this.page.getByTestId(`remove-${productSlug}`).click();
    }

    async continueShopping(): Promise<void> {
        await this.continueShoppingButton.click();
    }

    async proceedToCheckout(): Promise<void> {
        await this.checkoutButton.click();
    }
}
