import { test, expect } from '../../src/fixtures/step-screenshot.fixture';
import loginData from '../../src/testdata/login.json';
import inventoryData from '../../src/testdata/inventory.json';
import { LoginPage } from '../../src/pages/LoginPage';
import { InventoryPage } from '../../src/pages/InventoryPage';
import { CartPage } from '../../src/pages/CartPage';
import { ItemDetailPage } from '../../src/pages/ItemDetailPage';
import { CheckoutStepOnePage } from '../../src/pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '../../src/pages/CheckoutStepTwoPage';
import { CheckoutCompletePage } from '../../src/pages/CheckoutCompletePage';

const { username, password } = loginData.validUser;

type Product = { slug: string; name: string; price: string };
const products: Product[] = inventoryData.products;
const selectedSlugs = ['tta-bike-light', 'tta-practice-backpack'];
const checkoutProducts = products.filter((product) => selectedSlugs.includes(product.slug));

const toPrice = (value: string): number => Number(value.replace('$', ''));
const money = (value: number): string => `$${value.toFixed(2)}`;

const subtotal = checkoutProducts.reduce((sum, product) => sum + toPrice(product.price), 0);
const tax = Math.round(subtotal * 0.08 * 100) / 100;
const total = Math.round((subtotal + tax) * 100) / 100;

test.describe('E2E checkout', () => {
    test.beforeEach(async ({ page, step }) => {
        await step('Login with valid credentials', async () => {
            const loginPage = new LoginPage(page);
            await loginPage.goto();
            await loginPage.login(username, password);
            await expect(page).toHaveURL(/\/playwright\/ttacart\/inventory$/);
        });
    });

    test('completes the full checkout journey for multiple products', async ({ page, step }) => {
        const inventoryPage = new InventoryPage(page);
        const itemDetailPage = new ItemDetailPage(page);
        const cartPage = new CartPage(page);
        const checkoutStepOnePage = new CheckoutStepOnePage(page);
        const checkoutStepTwoPage = new CheckoutStepTwoPage(page);
        const checkoutCompletePage = new CheckoutCompletePage(page);

        await step('Add each product from its detail page', async () => {
            for (const product of checkoutProducts) {
                await itemDetailPage.goto(product.slug);
                await expect(itemDetailPage.itemName).toHaveText(product.name);
                await expect(itemDetailPage.itemPrice).toHaveText(product.price);
                await itemDetailPage.addToCart();
                await expect(itemDetailPage.removeButton).toBeVisible();
            }
        });

        await step('Verify the cart badge and contents', async () => {
            await expect(inventoryPage.cartBadge).toHaveText(String(checkoutProducts.length));
            await inventoryPage.openCart();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/cart$/);
            expect(await cartPage.getItemNames()).toEqual(checkoutProducts.map((product) => product.name));
            expect(await cartPage.getItemPrices()).toEqual(checkoutProducts.map((product) => product.price));
        });

        await step('Submit the shipping information', async () => {
            await cartPage.proceedToCheckout();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/checkout-step-one$/);
            await expect(checkoutStepOnePage.title).toHaveText('Checkout: Your Information');
            await checkoutStepOnePage.fillInformation('TTA', 'Tester', '560001');
            await checkoutStepOnePage.continueToOverview();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/checkout-step-two$/);
        });

        await step('Verify the order overview', async () => {
            await expect(checkoutStepTwoPage.title).toHaveText('Checkout: Overview');
            expect(await checkoutStepTwoPage.getItemNames()).toEqual(checkoutProducts.map((product) => product.name));
            await expect(checkoutStepTwoPage.subtotal).toHaveText(`Item total: ${money(subtotal)}`);
            await expect(checkoutStepTwoPage.tax).toHaveText(`Tax: ${money(tax)}`);
            await expect(checkoutStepTwoPage.total).toHaveText(`Total: ${money(total)}`);
            await expect(checkoutStepTwoPage.paymentInfo).toHaveText('TTACard #31337');
        });

        await step('Finish the order', async () => {
            await checkoutStepTwoPage.finish();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/checkout-complete$/);
            await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
        });

        await step('Return home with an emptied cart', async () => {
            await checkoutCompletePage.backHome();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/inventory$/);
            await expect(inventoryPage.cartBadge).toHaveCount(0);
        });
    });

    test('validates the checkout information form', async ({ page, step }) => {
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);
        const checkoutStepOnePage = new CheckoutStepOnePage(page);

        await step('Open the checkout information page', async () => {
            await inventoryPage.addToCart(checkoutProducts[0].slug);
            await inventoryPage.openCart();
            await cartPage.proceedToCheckout();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/checkout-step-one$/);
        });

        await step('Require the first name', async () => {
            await checkoutStepOnePage.continueToOverview();
            await expect(checkoutStepOnePage.errorMessage).toHaveText('Error: First Name is required');
        });

        await step('Require the last name', async () => {
            await checkoutStepOnePage.firstNameInput.fill('TTA');
            await checkoutStepOnePage.continueToOverview();
            await expect(checkoutStepOnePage.errorMessage).toHaveText('Error: Last Name is required');
        });

        await step('Require the postal code', async () => {
            await checkoutStepOnePage.lastNameInput.fill('Tester');
            await checkoutStepOnePage.continueToOverview();
            await expect(checkoutStepOnePage.errorMessage).toHaveText('Error: Postal Code is required');
        });
    });

    test('cancels the order overview back to the cart', async ({ page, step }) => {
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);
        const checkoutStepOnePage = new CheckoutStepOnePage(page);
        const checkoutStepTwoPage = new CheckoutStepTwoPage(page);

        await step('Reach the order overview', async () => {
            await inventoryPage.addToCart(checkoutProducts[0].slug);
            await inventoryPage.openCart();
            await cartPage.proceedToCheckout();
            await checkoutStepOnePage.fillInformation('TTA', 'Tester', '560001');
            await checkoutStepOnePage.continueToOverview();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/checkout-step-two$/);
        });

        await step('Cancel the order', async () => {
            await checkoutStepTwoPage.cancel();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/cart$/);
            expect(await cartPage.getItemNames()).toEqual([checkoutProducts[0].name]);
        });
    });
});
