import { test, expect } from '@playwright/test';
import { logger } from '../../../src/utils/logger';

test.describe('Restful Booker booking API', () => {
    test('TC#7 @p0 - DELETE: Verify that an existing booking can be deleted.', async ({ request }) => {
        const baseURL = process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com';
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };
        const bookingPayload = {
            firstname: 'Pramod',
            lastname: 'Dutta',
            totalprice: 111,
            depositpaid: true,
            bookingdates: {
                checkin: '2018-01-01',
                checkout: '2019-01-01',
            },
            additionalneeds: 'Breakfast',
        };
        let token = '';
        let bookingId = 0;

        await test.step('Step 1 - Create auth token', async () => {
            const url = new URL('/auth', baseURL).toString();
            logger.info(`[API] POST ${url}`);
            const response = await request.post(url, {
                headers,
                data: {
                    username: process.env.RESTFUL_BOOKER_USERNAME || 'admin',
                    password: process.env.RESTFUL_BOOKER_PASSWORD || 'password123',
                },
            });
            logger.info(`[API] Response status: ${response.status()}`);
            expect(response.status()).toBe(200);

            const data: { token: string } = await response.json();
            token = data.token;
            expect(token).toBeTruthy();
            logger.info('Created auth token for DELETE booking flow');
        });

        await test.step('Step 2 - Create booking to delete', async () => {
            const url = new URL('/booking', baseURL).toString();
            logger.info(`[API] POST ${url}`);
            logger.info(`[API] Request body: ${JSON.stringify(bookingPayload)}`);
            const response = await request.post(url, {
                headers,
                data: bookingPayload,
            });
            const responseBody = await response.text();
            logger.info(`[API] Response status: ${response.status()}`);
            logger.info(`[API] Response body: ${responseBody}`);
            expect(response.status()).toBe(200);

            const data: { bookingid: number } = JSON.parse(responseBody);
            bookingId = data.bookingid;
            expect(bookingId).toBeTruthy();
            logger.info(`Created booking id for DELETE: ${bookingId}`);
        });

        await test.step('Step 3 - Delete booking', async () => {
            const url = new URL(`/booking/${bookingId}`, baseURL).toString();
            logger.info(`[API] DELETE ${url}`);
            const response = await request.delete(url, {
                headers: {
                    ...headers,
                    Cookie: `token=${token}`,
                },
            });
            const responseBody = await response.text();
            logger.info(`[API] Response status: ${response.status()}`);
            logger.info(`[API] Response body: ${responseBody || '(empty)'}`);
            expect(response.status()).toBe(201);
        });

        await test.step('Step 4 - Verify booking no longer exists', async () => {
            const url = new URL(`/booking/${bookingId}`, baseURL).toString();
            logger.info(`[API] GET ${url}`);
            const response = await request.get(url);
            const responseBody = await response.text();
            logger.info(`[API] Response status: ${response.status()}`);
            logger.info(`[API] Response body: ${responseBody}`);
            expect(response.status()).toBe(404);
        });
    });
});
