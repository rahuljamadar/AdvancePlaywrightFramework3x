import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type CheckoutTotals = {
    itemTotal: string;
    tax: string;
    total: string;
};

export class CheckoutStepTwoPage extends BasePage {
    readonly summaryContainer: Locator;
    readonly itemRows: Locator;
    readonly itemNames: Locator;
    readonly itemPrices: Locator;
    readonly itemQuantities: Locator;
    readonly paymentInfo: Locator;
    readonly shippingInfo: Locator;
    readonly subtotal: Locator;
    readonly tax: Locator;
    readonly total: Locator;
    readonly cancelButton: Locator;
    readonly finishButton: Locator;

    constructor(page: Page) {
        super(page);
        this.summaryContainer = this.util.byCss('#checkout-summary');
        this.itemRows = this.util.byTestId('inventory-item');
        this.itemNames = this.util.byTestId('inventory-item-name');
        this.itemPrices = this.util.byTestId('inventory-item-price');
        this.itemQuantities = this.util.byTestId('item-quantity');
        this.paymentInfo = this.util.byTestId('payment-info-value');
        this.shippingInfo = this.util.byTestId('shipping-info-value');
        this.subtotal = this.util.byTestId('subtotal-label');
        this.tax = this.util.byTestId('tax-label');
        this.total = this.util.byTestId('total-label');
        this.cancelButton = this.util.byTestId('cancel');
        this.finishButton = this.util.byTestId('finish');
    }

    async goto(): Promise<void> {
        await this.page.goto(this.url('/checkout-step-two'));
    }

    async getItemNames(): Promise<string[]> {
        return this.util.texts(this.itemNames);
    }

    async getItemPrices(): Promise<string[]> {
        return this.util.texts(this.itemPrices);
    }

    async getItemQuantities(): Promise<string[]> {
        return this.util.texts(this.itemQuantities);
    }

    async getTotals(): Promise<CheckoutTotals> {
        return {
            itemTotal: await this.util.text(this.subtotal),
            tax: await this.util.text(this.tax),
            total: await this.util.text(this.total),
        };
    }

    async finish(): Promise<void> {
        await this.util.click(this.finishButton);
    }

    async cancel(): Promise<void> {
        await this.util.click(this.cancelButton);
    }
}

export default CheckoutStepTwoPage;
