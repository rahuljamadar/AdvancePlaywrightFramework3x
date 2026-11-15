import { type Locator } from '@playwright/test';
import { test as base, expect } from '../../src/fixtures/page-objects.fixture';
import loginData from '../../src/testdata/login.json';
import inventoryData from '../../src/testdata/inventory.json';

type LoginFixtures = {
    validLogin: Locator;
    invalidLogin: Locator;
};

const test = base.extend<LoginFixtures>({
    validLogin: async ({ page, step, loginPage, inventoryPage }, use) => {
        const inventoryTitle = inventoryPage.inventoryTitle;
        await step('Login Page - Submit valid credentials', async () => {
            await loginPage.goto();
            await loginPage.login(loginData.validUser.username, loginData.validUser.password);
            await expect(page).toHaveURL(/\/playwright\/ttacart\/inventory$/);
            await expect(page).toHaveTitle(loginData.validUser.expectedTitle);
        });

        await use(inventoryTitle);
    },
    invalidLogin: async ({ page, step, loginPage }, use) => {
        const scenario = loginData.invalidUsername;
        if (!scenario.expectedMessage) {
            throw new Error('Invalid login scenario must define an expected error message');
        }

        const errorMessage = page.getByText(scenario.expectedMessage, { exact: true });
        await step('Login Page - Reject invalid credentials', async () => {
            await loginPage.goto();
            await loginPage.login(scenario.username, scenario.password);
            await expect(page).toHaveTitle(scenario.expectedTitle);
            await expect(page).toHaveURL(/\/playwright\/ttacart\/$/);
            await expect(errorMessage).toBeVisible();
        });

        await use(errorMessage);
    },
});

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
    test.beforeEach(async ({ validLogin }) => {
        await expect(validLogin).toBeVisible();
    });

    test('completes the full checkout journey for multiple products', async ({
        page,
        step,
        inventoryPage,
        itemDetailPage,
        cartPage,
        checkoutStepOnePage,
        checkoutStepTwoPage,
        checkoutCompletePage,
    }) => {
        for (const product of checkoutProducts) {
            await step(`Item Detail Page - Add ${product.name} to cart`, async () => {
                await itemDetailPage.goto(product.slug);
                await expect(itemDetailPage.itemName).toHaveText(product.name);
                await expect(itemDetailPage.itemPrice).toHaveText(product.price);
                await itemDetailPage.addToCart();
                await expect(itemDetailPage.removeButton).toBeVisible();
            });
        }

        await step('Inventory Page - Verify the cart badge', async () => {
            await inventoryPage.goto();
            await expect(inventoryPage.cartBadge).toHaveText(String(checkoutProducts.length));
        });

        await step('Navigation - Open the Cart Page', async () => {
            await inventoryPage.openCart();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/cart$/);
        });

        await step('Cart Page - Verify selected products', async () => {
            expect(await cartPage.getItemNames()).toEqual(checkoutProducts.map((product) => product.name));
            expect(await cartPage.getItemPrices()).toEqual(checkoutProducts.map((product) => product.price));
        });

        await step('Navigation - Open the Checkout Information Page', async () => {
            await cartPage.proceedToCheckout();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/checkout-step-one$/);
        });

        await step('Checkout Information Page - Fill shipping information', async () => {
            await expect(checkoutStepOnePage.title).toHaveText('Checkout: Your Information');
            await checkoutStepOnePage.fillInformation('TTA', 'Tester', '560001');
        });

        await step('Navigation - Submit shipping information and open the Checkout Overview Page', async () => {
            await checkoutStepOnePage.continueToOverview();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/checkout-step-two$/);
        });

        await step('Checkout Overview Page - Verify order details and totals', async () => {
            await expect(checkoutStepTwoPage.title).toHaveText('Checkout: Overview');
            expect(await checkoutStepTwoPage.getItemNames()).toEqual(checkoutProducts.map((product) => product.name));
            await expect(checkoutStepTwoPage.subtotal).toHaveText(`Item total: ${money(subtotal)}`);
            await expect(checkoutStepTwoPage.tax).toHaveText(`Tax: ${money(tax)}`);
            await expect(checkoutStepTwoPage.total).toHaveText(`Total: ${money(total)}`);
            await expect(checkoutStepTwoPage.paymentInfo).toHaveText('TTACard #31337');
        });

        await step('Navigation - Finish the order and open the completion page', async () => {
            await checkoutStepTwoPage.finish();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/checkout-complete$/);
        });

        await step('Checkout Complete Page - Confirm the order', async () => {
            await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
        });

        await step('Navigation - Return to the Inventory Page', async () => {
            await checkoutCompletePage.backHome();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/inventory$/);
        });

        await step('Inventory Page - Verify the cart is empty', async () => {
            await expect(inventoryPage.cartBadge).toHaveCount(0);
        });
    });

    test('validates the checkout information form', async ({
        page,
        step,
        inventoryPage,
        cartPage,
        checkoutStepOnePage,
    }) => {
        await step('Inventory Page - Add a product to the cart', async () => {
            await inventoryPage.addToCart(checkoutProducts[0].slug);
            await expect(inventoryPage.cartBadge).toHaveText('1');
        });

        await step('Navigation - Open the Cart Page', async () => {
            await inventoryPage.openCart();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/cart$/);
        });

        await step('Cart Page - Verify the selected product', async () => {
            expect(await cartPage.getItemNames()).toEqual([checkoutProducts[0].name]);
        });

        await step('Navigation - Open the Checkout Information Page', async () => {
            await cartPage.proceedToCheckout();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/checkout-step-one$/);
        });

        await step('Checkout Information Page - Validate the first name', async () => {
            await checkoutStepOnePage.continueToOverview();
            await expect(checkoutStepOnePage.errorMessage).toHaveText('Error: First Name is required');
        });

        await step('Checkout Information Page - Validate the last name', async () => {
            await checkoutStepOnePage.firstNameInput.fill('TTA');
            await checkoutStepOnePage.continueToOverview();
            await expect(checkoutStepOnePage.errorMessage).toHaveText('Error: Last Name is required');
        });

        await step('Checkout Information Page - Validate the postal code', async () => {
            await checkoutStepOnePage.lastNameInput.fill('Tester');
            await checkoutStepOnePage.continueToOverview();
            await expect(checkoutStepOnePage.errorMessage).toHaveText('Error: Postal Code is required');
        });
    });

    test('cancels the order overview back to the cart', async ({
        page,
        step,
        inventoryPage,
        cartPage,
        checkoutStepOnePage,
        checkoutStepTwoPage,
    }) => {
        await step('Inventory Page - Add a product to the cart', async () => {
            await inventoryPage.addToCart(checkoutProducts[0].slug);
            await expect(inventoryPage.cartBadge).toHaveText('1');
        });

        await step('Navigation - Open the Cart Page', async () => {
            await inventoryPage.openCart();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/cart$/);
        });

        await step('Cart Page - Verify the selected product', async () => {
            expect(await cartPage.getItemNames()).toEqual([checkoutProducts[0].name]);
        });

        await step('Navigation - Open the Checkout Information Page', async () => {
            await cartPage.proceedToCheckout();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/checkout-step-one$/);
        });

        await step('Checkout Information Page - Fill shipping details', async () => {
            await checkoutStepOnePage.fillInformation('TTA', 'Tester', '560001');
        });

        await step('Navigation - Submit shipping details and open the Checkout Overview Page', async () => {
            await checkoutStepOnePage.continueToOverview();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/checkout-step-two$/);
        });

        await step('Navigation - Cancel the overview and return to the Cart Page', async () => {
            await checkoutStepTwoPage.cancel();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/cart$/);
        });

        await step('Cart Page - Verify the product remains in the cart', async () => {
            expect(await cartPage.getItemNames()).toEqual([checkoutProducts[0].name]);
        });
    });
});

test.describe('E2E login fixtures', () => {
    test('rejects invalid login credentials', async ({ invalidLogin }) => {
        await expect(invalidLogin).toBeVisible();
    });
});
