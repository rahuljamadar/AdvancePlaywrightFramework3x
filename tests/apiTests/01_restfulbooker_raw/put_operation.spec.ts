import { test, expect, type APIRequestContext } from '@playwright/test';
import { logger } from '../../../src/utils/logger';

const baseURL = process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com';
const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};
const payload = {
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

async function createBooking(request: APIRequestContext): Promise<number> {
    const url = new URL('/booking', baseURL).toString();
    logger.info(`[API] POST ${url}`);
    const response = await request.post(url, {
        headers,
        data: payload,
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
    test('TC#3 @p0 - PUT: Verify that updating an existing booking is working.', async ({ request }) => {
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
            logger.info('Created auth token for PUT booking flow');
        });

        await test.step('Step 2 - Create booking to update', async () => {
            const url = new URL('/booking', baseURL).toString();
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

            const data: { bookingid: number } = JSON.parse(responseBody);
            bookingId = data.bookingid;
            expect(bookingId).toBeTruthy();
            logger.info(`Created booking id for update: ${bookingId}`);
        });

        await test.step('Step 3 - Update booking', async () => {
            const url = new URL(`/booking/${bookingId}`, baseURL).toString();
            logger.info(`[API] PUT ${url}`);
            logger.info(`[API] Request body: ${JSON.stringify(payload)}`);
            const response = await request.put(url, {
                headers: {
                    ...headers,
                    Cookie: `token=${token}`,
                },
                data: payload,
            });
            const responseBody = await response.text();
            logger.info(`[API] Response status: ${response.status()}`);
            logger.info(`[API] Response body: ${responseBody}`);
            expect(response.status()).toBe(200);

            const data = JSON.parse(responseBody);
            expect(data.firstname).toBe(payload.firstname);
            expect(data.lastname).toBe(payload.lastname);
            expect(data.totalprice).toBe(payload.totalprice);
            expect(data.depositpaid).toBe(payload.depositpaid);
            expect(data.bookingdates.checkin).toBe(payload.bookingdates.checkin);
            expect(data.bookingdates.checkout).toBe(payload.bookingdates.checkout);
            expect(data.additionalneeds).toBe(payload.additionalneeds);
            logger.info(`Updated booking id ${bookingId}: ${data.firstname} ${data.lastname}`);
        });
    });

    test('TC#4 @p1 - PUT: Verify that an update without authentication is rejected.', async ({ request }) => {
        let bookingId = 0;

        await test.step('Step 1 - Create booking for the negative scenario', async () => {
            bookingId = await createBooking(request);
        });

        await test.step('Step 2 - Attempt update without authentication', async () => {
            const url = new URL(`/booking/${bookingId}`, baseURL).toString();
            logger.info(`[API] PUT ${url} without authentication`);
            const response = await request.put(url, {
                headers,
                data: payload,
            });
            const responseBody = await response.text();
            logger.info(`[API] Response status: ${response.status()}`);
            logger.info(`[API] Response body: ${responseBody}`);
            expect(response.status()).toBe(403);
        });
    });

    test('TC#5 @p1 - PUT: Verify that an update with an invalid token is rejected.', async ({ request }) => {
        let bookingId = 0;

        await test.step('Step 1 - Create booking for the negative scenario', async () => {
            bookingId = await createBooking(request);
        });

        await test.step('Step 2 - Attempt update with an invalid token', async () => {
            const url = new URL(`/booking/${bookingId}`, baseURL).toString();
            logger.info(`[API] PUT ${url} with an invalid token`);
            const response = await request.put(url, {
                headers: {
                    ...headers,
                    Cookie: 'token=invalid-token',
                },
                data: payload,
            });
            const responseBody = await response.text();
            logger.info(`[API] Response status: ${response.status()}`);
            logger.info(`[API] Response body: ${responseBody}`);
            expect(response.status()).toBe(403);
        });
    });
});
