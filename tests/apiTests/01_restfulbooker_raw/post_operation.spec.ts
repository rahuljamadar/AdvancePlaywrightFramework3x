import { test, expect } from '@playwright/test';
import { logger } from '../../../src/utils/logger';

test.describe('Restful Booker booking API', () => {
    test('TC#2 @p0 - POST: Verify that creating a booking is working.', async ({ request }) => {
        const baseURL = process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com';
        const payload = {
            firstname: 'Jim',
            lastname: 'Brown',
            totalprice: 111,
            depositpaid: true,
            bookingdates: {
                checkin: '2018-01-01',
                checkout: '2019-01-01',
            },
            additionalneeds: 'Breakfast',
        };

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL('/booking', baseURL).toString();

        await test.step('Step 1 - Create booking with POST /booking', async () => {
            logger.info(`[API] POST ${url}`);
            logger.info(`[API] Request body: ${JSON.stringify(payload)}`);
            const response = await request.post(url, {
                headers,
                data: payload,
            });
            const responseBody = await response.text();
            logger.info(`[API] Response status: ${response.status()}`);
            logger.info(`[API] Response body: ${responseBody}`);
            expect(response.status()).toBe(200);

            const data = JSON.parse(responseBody);
            expect(data.bookingid).toBeTruthy();
            expect(data.booking.firstname).toBe(payload.firstname);
            expect(data.booking.lastname).toBe(payload.lastname);
            expect(data.booking.bookingdates.checkin).toBe(payload.bookingdates.checkin);
            expect(data.booking.bookingdates.checkout).toBe(payload.bookingdates.checkout);
        });
    });
});