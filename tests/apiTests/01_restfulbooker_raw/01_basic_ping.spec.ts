import { test, expect } from '@playwright/test';

test('ping request -GET', async ({ request }) => {
    const baseURL = process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com';
    const response = await request.get(new URL('/ping', baseURL).toString());
    expect(response.status()).toBe(201);
});
