import { test, expect, type APIRequestContext } from '@playwright/test';
import { logger } from '../../../src/utils/logger';

async function createBooking(request: APIRequestContext): Promise<number> {
    const baseURL = process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com';
    const url = new URL('/booking', baseURL).toString();
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };
    const response = await request.post(url, {
        headers,
        data: {
            firstname: 'Pramod',
            lastname: 'Dutta',
            totalprice: 111,
            depositpaid: true,
            bookingdates: {
                checkin: '2018-01-01',
                checkout: '2019-01-01',
            },
            additionalneeds: 'Breakfast',
        },
    });
    const responseBody = await response.text();
    logger.info(`[API] Response status: ${response.status()}`);
    logger.info(`[API] Response body: ${responseBody}`);
    expect(response.status()).toBe(200);

    const data: { bookingid: number } = JSON.parse(responseBody);
    expect(data.bookingid).toBeTruthy();
    return data.bookingid;
}

test.describe('Restful Booker booking API', () => {
    test('TC#6 @p0 - PATCH: Verify that updating part of an existing booking is working.', async ({ request }) => {
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
        const patchPayload = {
            firstname: 'Updated with PATCH',
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
            logger.info('Created auth token for PATCH booking flow');
        });

        await test.step('Step 2 - Create booking to partially update', async () => {
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
            logger.info(`Created booking id for PATCH: ${bookingId}`);
        });

        await test.step('Step 3 - Partially update booking with PATCH', async () => {
            const url = new URL(`/booking/${bookingId}`, baseURL).toString();
            logger.info(`[API] PATCH ${url}`);
            logger.info(`[API] Request body: ${JSON.stringify(patchPayload)}`);
            const response = await request.patch(url, {
                headers: {
                    ...headers,
                    Cookie: `token=${token}`,
                },
                data: patchPayload,
            });
            const responseBody = await response.text();
            logger.info(`[API] Response status: ${response.status()}`);
            logger.info(`[API] Response body: ${responseBody}`);
            expect(response.status()).toBe(200);

            const data = JSON.parse(responseBody);
            expect(data.firstname).toBe(patchPayload.firstname);
            expect(data.lastname).toBe(bookingPayload.lastname);
            expect(data.totalprice).toBe(bookingPayload.totalprice);
            expect(data.bookingdates.checkin).toBe(bookingPayload.bookingdates.checkin);
            expect(data.bookingdates.checkout).toBe(bookingPayload.bookingdates.checkout);
        });
    });

    test('TC#10 @p1 - PATCH: Verify that an update without authentication is rejected.', async ({ request }) => {
        const baseURL = process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com';
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };
        let bookingId = 0;

        await test.step('Step 1 - Create booking for the negative scenario', async () => {
            bookingId = await createBooking(request);
        });

        await test.step('Step 2 - Attempt PATCH without authentication', async () => {
            const url = new URL(`/booking/${bookingId}`, baseURL).toString();
            logger.info(`[API] PATCH ${url} without authentication`);
            const response = await request.patch(url, {
                headers,
                data: { firstname: 'Unauthorized update' },
            });
            const responseBody = await response.text();
            logger.info(`[API] Response status: ${response.status()}`);
            logger.info(`[API] Response body: ${responseBody}`);
            expect(response.status()).toBe(403);
        });
    });

    test('TC#11 @p1 - PATCH: Verify that an update with an invalid token is rejected.', async ({ request }) => {
        const baseURL = process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com';
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };
        let bookingId = 0;

        await test.step('Step 1 - Create booking for the negative scenario', async () => {
            bookingId = await createBooking(request);
        });

        await test.step('Step 2 - Attempt PATCH with an invalid token', async () => {
            const url = new URL(`/booking/${bookingId}`, baseURL).toString();
            logger.info(`[API] PATCH ${url} with an invalid token`);
            const response = await request.patch(url, {
                headers: {
                    ...headers,
                    Cookie: 'token=invalid-token',
                },
                data: { firstname: 'Unauthorized update' },
            });
            const responseBody = await response.text();
            logger.info(`[API] Response status: ${response.status()}`);
            logger.info(`[API] Response body: ${responseBody}`);
            expect(response.status()).toBe(403);
        });
    });
});
