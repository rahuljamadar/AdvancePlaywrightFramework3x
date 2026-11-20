import { test, expect } from '@playwright/test';
import { logger } from '../../../src/utils/logger';

test.describe('Restful Booker booking API', () => {
    test('TC#1 @p0 - GET: Verify the ping endpoint is working.', async ({ request }) => {
        const baseURL = process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com';
        const url = new URL('/ping', baseURL).toString();

        await test.step('Step 1 - Send GET /ping request', async () => {
            logger.info(`[API] GET ${url}`);
            const response = await request.get(url);
            const responseBody = await response.text();
            logger.info(`[API] Response status: ${response.status()}`);
            logger.info(`[API] Response body: ${responseBody || '(empty)'}`);
            expect(response.status()).toBe(201);
        });
    });

    test('TC#12 @p1 - GET: Verify that a missing booking returns not found.', async ({ request }) => {
        const baseURL = process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com';
        const bookingId = 999999999;
        const url = new URL(`/booking/${bookingId}`, baseURL).toString();

        await test.step('Step 1 - Request a booking that does not exist', async () => {
            logger.info(`[API] GET ${url}`);
            const response = await request.get(url);
            const responseBody = await response.text();
            logger.info(`[API] Response status: ${response.status()}`);
            logger.info(`[API] Response body: ${responseBody}`);
            expect(response.status()).toBe(404);
        });
    });
});
