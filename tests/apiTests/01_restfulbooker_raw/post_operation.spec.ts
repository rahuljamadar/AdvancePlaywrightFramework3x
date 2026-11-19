import { test, expect } from '@playwright/test';

test('POST request - create booking', async ({ request }) => {
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
        'Accept': 'application/json',
        'content-type': 'application/json',
    };

    const response = await request.post('/booking', {
        headers,
        data: payload
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.bookingid).toBeTruthy();
    expect(data.booking.firstname).toBe(payload.firstname);
    expect(data.booking.lastname).toBe(payload.lastname);
});