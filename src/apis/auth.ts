import { client } from './common';

export async function getStatus(): Promise<Record<string, any>> {
  return client.get('auth/status').json();
}

export async function signIn(email: string, password: string): Promise<Record<string, any>> {
  return client.post('auth/signin', {
    json: {
      email,
      password,
      recaptchaResponse: '',
    }
  }).json();
}
