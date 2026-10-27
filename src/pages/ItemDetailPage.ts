import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ItemDetailPage extends BasePage {
    readonly detailContainer: Locator;
    readonly backButton: Locator;
    readonly itemName: Locator;
    readonly itemDescription: Locator;
    readonly itemPrice: Locator;
    readonly addToCartButton: Locator;
    readonly removeButton: Locator;
    readonly notFoundMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.detailContainer = this.util.byTestId('inventory-item-detail');
        this.backButton = this.util.byTestId('back-to-products');
        this.itemName = this.util.byTestId('inventory-item-name');
        this.itemDescription = this.util.byTestId('inventory-item-desc');
        this.itemPrice = this.util.byTestId('inventory-item-price');
        this.addToCartButton = this.util.byTestId('add-to-cart');
        this.removeButton = this.util.byTestId('remove');
        this.notFoundMessage = this.util.byTestId('not-found');
    }

    async goto(productId: string): Promise<void> {
        await this.page.goto(this.url(`/inventory-item?id=${productId}`));
    }

    async name(): Promise<string> {
        return this.util.text(this.itemName);
    }

    async price(): Promise<string> {
        return this.util.text(this.itemPrice);
    }

    async addToCart(): Promise<void> {
        await this.util.click(this.addToCartButton);
    }

    async removeFromCart(): Promise<void> {
        await this.util.click(this.removeButton);
    }

    async backToProducts(): Promise<void> {
        await this.util.click(this.backButton);
    }
}

export default ItemDetailPage;
