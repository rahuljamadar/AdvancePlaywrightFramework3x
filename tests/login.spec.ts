import { test, expect } from '../src/fixtures/step-screenshot.fixture';
import loginData from '../src/testdata/login.json';
import { LoginPage } from '../src/pages/LoginPage';

test.describe('Login scenarios from test data', () => {
    for (const [scenarioName, scenario] of Object.entries(loginData)) {
        test(`login with ${scenarioName}`, async ({ page, step }) => {
            const loginPage = new LoginPage(page);

            await step('Open the login page', async () => {
                await loginPage.goto();
            });
            await step('Submit the scenario credentials', async () => {
                await loginPage.login(scenario.username, scenario.password);
            });
            await step(`Verify the ${scenario.expectedPage} outcome`, async () => {
                await expect(page).toHaveTitle(scenario.expectedTitle);

                if (scenario.expectedPage === 'inventory') {
                    await expect(page).toHaveURL(/\/playwright\/ttacart\/inventory$/);
                } else {
                    await expect(page).toHaveURL(/\/playwright\/ttacart\/$/);
                }

                if (scenario.expectedMessage) {
                    await expect(page.getByText(scenario.expectedMessage, { exact: true })).toBeVisible();
                } else {
                    await expect(page.getByText(/^Epic sadface:/)).toHaveCount(0);
                }
            });
        });
    }
});
