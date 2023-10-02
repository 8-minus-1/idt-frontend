import ky from 'ky';

export const client = ky.extend({
  prefixUrl: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:4000/api',
  headers: {
    'X-No-CSRF': '1',
  },
  credentials: 'include',
});
