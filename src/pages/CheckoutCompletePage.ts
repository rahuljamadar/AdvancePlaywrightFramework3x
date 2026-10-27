import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutCompletePage extends BasePage {
    readonly container: Locator;
    readonly completeHeader: Locator;
    readonly completeText: Locator;
    readonly backHomeButton: Locator;

    constructor(page: Page) {
        super(page);
        this.container = this.util.byTestId('checkout-complete-container');
        this.completeHeader = this.util.byTestId('complete-header');
        this.completeText = this.util.byTestId('complete-text');
        this.backHomeButton = this.util.byTestId('back-to-products');
    }

    async goto(): Promise<void> {
        await this.page.goto(this.url('/checkout-complete'));
    }

    async header(): Promise<string> {
        return this.util.text(this.completeHeader);
    }

    async message(): Promise<string> {
        return this.util.text(this.completeText);
    }

    async backHome(): Promise<void> {
        await this.util.click(this.backHomeButton);
    }
}

export default CheckoutCompletePage;
