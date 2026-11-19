import { test, expect } from '@playwright/test';

test('ping request -GET', async ({ request }) => {
    const response = await request.get('/ping');
    expect(response.status()).toBe(201);
});
