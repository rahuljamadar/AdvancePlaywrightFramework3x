import { test, expect } from '../src/fixtures/step-screenshot.fixture';
import loginData from '../src/testdata/login.json';
import cartData from '../src/testdata/cart.json';
import { LoginPage } from '../src/pages/LoginPage';
import { InventoryPage } from '../src/pages/InventoryPage';
import { CartPage } from '../src/pages/CartPage';

const { username, password } = loginData.validUser;

type CartProduct = { slug: string; name: string; price: string };
type CartScenario = { addProducts: CartProduct[]; removeProducts?: string[]; expectedBadge: string | null };
type CartPageInfo = { url: string; title: string; heading: string; emptyMessage: string };

const cartPageInfo: CartPageInfo = cartData.page;
const scenarios: Record<string, CartScenario> = cartData.scenarios;

test.describe('Cart scenarios from test data', () => {
    for (const [scenarioName, scenario] of Object.entries(scenarios)) {
        test(`shows the cart for ${scenarioName}`, async ({ page, step }) => {
            const loginPage = new LoginPage(page);
            const inventoryPage = new InventoryPage(page);
            const cartPage = new CartPage(page);

            const removed = scenario.removeProducts ?? [];
            const expectedRows = scenario.addProducts.filter((product) => !removed.includes(product.slug));

            await step('Login with valid credentials', async () => {
                await loginPage.goto();
                await loginPage.login(username, password);
                await expect(page).toHaveURL(/\/playwright\/ttacart\/inventory$/);
            });

            await step('Add the scenario products to the cart', async () => {
                for (const product of scenario.addProducts) {
                    await inventoryPage.addToCart(product.slug);
                }
            });

            await step('Open the cart page', async () => {
                await inventoryPage.openCart();
                await expect(page).toHaveURL(new RegExp(`${cartPageInfo.url}$`));
                await expect(page).toHaveTitle(cartPageInfo.title);
                await expect(cartPage.cartTitle).toHaveText(cartPageInfo.heading);
            });

            await step('Remove the requested products from the cart', async () => {
                for (const productSlug of removed) {
                    await cartPage.removeItem(productSlug);
                }
            });

            await step('Verify the cart contents', async () => {
                if (expectedRows.length === 0) {
                    await expect(cartPage.emptyMessage).toHaveText(cartPageInfo.emptyMessage);
                }

                await expect(cartPage.cartRows).toHaveCount(expectedRows.length);
                expect(await cartPage.getItemNames()).toEqual(expectedRows.map((product) => product.name));
                expect(await cartPage.getItemPrices()).toEqual(expectedRows.map((product) => product.price));
                expect(await cartPage.getItemQuantities()).toEqual(expectedRows.map(() => '1'));
            });

            await step('Verify the cart badge', async () => {
                if (scenario.expectedBadge === null) {
                    await expect(cartPage.cartBadge).toHaveCount(0);
                } else {
                    await expect(cartPage.cartBadge).toHaveText(scenario.expectedBadge);
                }
            });
        });
    }
});

test.describe('Cart actions', () => {
    test.beforeEach(async ({ page, step }) => {
        await step('Login with valid credentials', async () => {
            const loginPage = new LoginPage(page);
            await loginPage.goto();
            await loginPage.login(username, password);
            await expect(page).toHaveURL(/\/playwright\/ttacart\/inventory$/);
        });
    });

    test('continues shopping back to the inventory page', async ({ page, step }) => {
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);

        await step('Add a product and open the cart', async () => {
            await inventoryPage.addToCart('tta-bike-light');
            await inventoryPage.openCart();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/cart$/);
        });

        await step('Continue shopping', async () => {
            await cartPage.continueShopping();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/inventory$/);
        });
    });

    test('proceeds to checkout with the cart contents', async ({ page, step }) => {
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);

        await step('Add a product and open the cart', async () => {
            await inventoryPage.addToCart('tta-bike-light');
            await inventoryPage.openCart();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/cart$/);
        });

        await step('Proceed to checkout', async () => {
            await cartPage.proceedToCheckout();
            await expect(page).toHaveURL(/\/playwright\/ttacart\/checkout-step-one$/);
            await expect(page.getByTestId('title')).toHaveText('Checkout: Your Information');
        });
    });
});

test.describe('Cart access control', () => {
    test('redirects unauthenticated visitors to the login page', async ({ page, step }) => {
        const cartPage = new CartPage(page);

        await step('Open the cart page without a session', async () => {
            await cartPage.goto();
        });

        await step('Verify the login page is shown', async () => {
            await expect(page).toHaveURL(/\/playwright\/ttacart\/$/);
            await expect(page).toHaveTitle('TTACart - Login');
        });
    });
});
