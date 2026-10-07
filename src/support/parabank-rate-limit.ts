type RateLimitResponse = {
  status(): number;
  text(): Promise<string>;
};

let rateLimited = false;

export function isParaBankRateLimited(): boolean {
  return rateLimited;
}

export function throwIfRateLimited(status: number, body: string, operation: string): void {
  if (status === 429 || /error\s*1015|rate limit|too many requests/i.test(body)) {
    rateLimited = true;
    throw new Error(
      `ParaBank rate-limited ${operation} (HTTP ${status}${/error\s*1015/i.test(body) ? ', Cloudflare error 1015' : ''}). ` +
      'The suite stopped without retrying to avoid extending the limit. Wait for the block to clear, ' +
      'then use an approved isolated ParaBank URL for parallel runs.'
    );
  }
}

export async function checkRateLimitResponse(response: RateLimitResponse, operation: string): Promise<void> {
  if (response.status() !== 429 && response.status() !== 403 && response.status() !== 503) {
    return;
  }
  throwIfRateLimited(response.status(), await response.text(), operation);
}

export async function navigateParaBank(page: {
  goto(url: string): Promise<RateLimitResponse | null>;
}, url: string): Promise<void> {
  const baseUrl = process.env.PARABANK_BASE_URL || 'https://parabank.parasoft.com/parabank/';
  const response = await page.goto(new URL(url, baseUrl).toString());
  if (response) {
    await checkRateLimitResponse(response, `page navigation to ${url}`);
  }
}
