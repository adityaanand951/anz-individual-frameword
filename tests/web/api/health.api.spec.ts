import { test, expect } from '@playwright/test';

test('demo endpoint is reachable', async ({ request, baseURL }) => {
  const response = await request.get(baseURL || '/');
  expect(response.ok()).toBeTruthy();
});
