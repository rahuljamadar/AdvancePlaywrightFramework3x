import { test, expect } from '../src/fixtures/step-screenshot.fixture';
import loginData from '../src/testdata/login.json';
import inventoryData from '../src/testdata/inventory.json';
import { LoginPage } from '../src/pages/LoginPage';
import { InventoryPage } from '../src/pages/InventoryPage';

const { username, password } = loginData.validUser;
const products = inventoryData.products;

const toPrice = (value: string): number => Number(value.replace('$', ''));
const ascending = products.map((product) => toPrice(product.price)).sort((a, b) => a - b);

test.describe('Inventory scenarios', () => {
    let inventoryPage: InventoryPage;

    test.beforeEach(async ({ page, step }) => {
        await step('Login with valid credentials', async () => {
            const loginPage = new LoginPage(page);
            await loginPage.goto();
            await loginPage.login(username, password);
            await expect(page).toHaveURL(/\/playwright\/ttacart\/inventory$/);
        });

        inventoryPage = new InventoryPage(page);

        await step('Open the inventory page', async () => {
            await inventoryPage.goto();
        });
    });

    test('displays every product with its name and price', async ({ page, step }) => {
        await step('Verify the page header', async () => {
            await expect(page).toHaveTitle(inventoryData.expectedTitle);
            await expect(inventoryPage.inventoryTitle).toHaveText(inventoryData.pageHeading);
        });

        await step('Verify the product catalogue', async () => {
            await expect(inventoryPage.inventoryItems).toHaveCount(products.length);
            expect(await inventoryPage.getProductNames()).toEqual(products.map((product) => product.name));
            expect(await inventoryPage.getProductPrices()).toEqual(products.map((product) => product.price));
        });
    });

    test('sorts the products by name and by price', async ({ step }) => {
        await step('Sort by name (A to Z)', async () => {
            await inventoryPage.sortBy('az');
            expect(await inventoryPage.getProductNames()).toEqual(products.map((product) => product.name));
        });

        await step('Sort by name (Z to A)', async () => {
            await inventoryPage.sortBy('za');
            expect(await inventoryPage.getProductNames()).toEqual([...products].reverse().map((product) => product.name));
        });

        await step('Sort by price (low to high)', async () => {
            await inventoryPage.sortBy('lohi');
            expect((await inventoryPage.getProductPrices()).map(toPrice)).toEqual(ascending);
        });

        await step('Sort by price (high to low)', async () => {
            await inventoryPage.sortBy('hilo');
            expect((await inventoryPage.getProductPrices()).map(toPrice)).toEqual([...ascending].reverse());
        });
    });

    test('adds products to the cart and updates the badge', async ({ page, step }) => {
        const [first, second] = products;

        await step('Add two products to the cart', async () => {
            await inventoryPage.addToCart(first.slug);
            await expect(page.getByTestId(`remove-${first.slug}`)).toBeVisible();

            await inventoryPage.addToCart(second.slug);
            await expect(page.getByTestId(`remove-${second.slug}`)).toBeVisible();
        });

        await step('Verify the shopping cart badge', async () => {
            await expect(inventoryPage.cartBadge).toHaveText('2');
        });
    });

    test('removes a product from the cart', async ({ page, step }) => {
        const first = products[0];

        await step('Add the product to the cart', async () => {
            await inventoryPage.addToCart(first.slug);
            await expect(inventoryPage.cartBadge).toHaveText('1');
        });

        await step('Remove the product from the cart', async () => {
            await inventoryPage.removeFromCart(first.slug);
            await expect(page.getByTestId(`add-to-cart-${first.slug}`)).toBeVisible();
            await expect(inventoryPage.cartBadge).toHaveCount(0);
        });
    });

    test('opens the cart page from the header', async ({ page, step }) => {
        await step('Add a product and open the cart', async () => {
            await inventoryPage.addToCart(products[0].slug);
            await inventoryPage.openCart();
        });

        await step('Verify the cart page', async () => {
            await expect(page).toHaveURL(/\/playwright\/ttacart\/cart$/);
            await expect(page).toHaveTitle(inventoryData.cartPageTitle);
        });
    });

    test('logs out from the side menu', async ({ page, step }) => {
        await step('Logout from the side menu', async () => {
            await expect(inventoryPage.openMenuButton).toBeVisible();
            await inventoryPage.logout();
        });

        await step('Verify the user is returned to the login page', async () => {
            await expect(page).toHaveURL(/\/playwright\/ttacart\/$/);
            await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
        });
    });
});

test.describe('Inventory access control', () => {
    test('redirects unauthenticated visitors to the login page', async ({ page, step }) => {
        const inventoryPage = new InventoryPage(page);

        await step('Open the inventory page without a session', async () => {
            await inventoryPage.goto();
        });

        await step('Verify the login page is shown', async () => {
            await expect(page).toHaveURL(/\/playwright\/ttacart\/$/);
            await expect(page).toHaveTitle('TTACart - Login');
        });
    });
});
