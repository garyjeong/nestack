import { registerAs } from '@nestjs/config';

export default registerAs('openbanking', () => ({
  baseUrl: process.env.OPENBANKING_BASE_URL || 'https://testapi.openbanking.or.kr',
  clientId: process.env.OPENBANKING_CLIENT_ID || '',
  clientSecret: process.env.OPENBANKING_CLIENT_SECRET || '',
  redirectUri:
    process.env.OPENBANKING_REDIRECT_URI ||
    'http://localhost:3000/api/v1/finance/openbanking/callback',
  useCode: process.env.OPENBANKING_USE_CODE || '',
}));
