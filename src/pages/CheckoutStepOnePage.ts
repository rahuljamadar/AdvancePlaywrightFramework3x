import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutStepOnePage extends BasePage {
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly postalCodeInput: Locator;
    readonly errorMessage: Locator;
    readonly continueButton: Locator;
    readonly cancelButton: Locator;

    constructor(page: Page) {
        super(page);
        this.firstNameInput = this.util.byTestId('firstName');
        this.lastNameInput = this.util.byTestId('lastName');
        this.postalCodeInput = this.util.byTestId('postalCode');
        this.errorMessage = this.util.byTestId('error');
        this.continueButton = this.util.byTestId('continue');
        this.cancelButton = this.util.byTestId('cancel');
    }

    async goto(): Promise<void> {
        await this.page.goto(this.url('/checkout-step-one'));
    }

    async fillInformation(firstName: string, lastName: string, postalCode: string): Promise<void> {
        await this.util.fill(this.firstNameInput, firstName);
        await this.util.fill(this.lastNameInput, lastName);
        await this.util.fill(this.postalCodeInput, postalCode);
    }

    async continueToOverview(): Promise<void> {
        await this.util.click(this.continueButton);
    }

    async cancel(): Promise<void> {
        await this.util.click(this.cancelButton);
    }

    async errorText(): Promise<string> {
        return this.util.text(this.errorMessage);
    }
}

export default CheckoutStepOnePage;
