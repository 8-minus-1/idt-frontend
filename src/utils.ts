import { RecaptchaSiteKey } from './constants';

export function tryParse(json: string) {
  try {
    return JSON.parse(json);
  } catch {}
  return null;
}

export function getRecaptchaToken(): Promise<string | null> {
  let g = (globalThis as any).grecaptcha;
  if (typeof g === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((res, rej) => {
    g.ready(() => {
      g.execute(RecaptchaSiteKey)
        .then((token: string) => res(token))
        .catch(rej);
    });
  });
}
