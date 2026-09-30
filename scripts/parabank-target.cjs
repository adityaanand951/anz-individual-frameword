const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const defaultBaseUrl = 'https://parabank.parasoft.com/parabank/';

function ensureIsolatedTargetForParallelRun() {
  const baseUrl = process.env.PARABANK_BASE_URL || defaultBaseUrl;
  let hostname;

  try {
    hostname = new URL(baseUrl).hostname.toLowerCase();
  } catch {
    throw new Error('PARABANK_BASE_URL must be a valid absolute URL.');
  }

  if (hostname === 'parabank.parasoft.com') {
    throw new Error(
      'ParaBank runs are currently blocked for the shared public demo because it returned Cloudflare error 1015 (rate limited). ' +
      'Wait for the limit to clear or set PARABANK_BASE_URL to an approved isolated instance. ' +
      'Do not retry against the public demo while the 1015 response persists.'
    );
  }
}

module.exports = { ensureIsolatedTargetForParallelRun };
