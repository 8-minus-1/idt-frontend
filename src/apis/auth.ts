import { client } from './common';

export async function signIn(
  email: string,
  password: string,
  recaptchaResponse: string
): Promise<string> {
  return client
    .post('auth/signin', {
      json: {
        email,
        password,
        recaptchaResponse,
      },
    })
    .text();
}

export async function isEmailRegistered(email: string): Promise<boolean> {
  let res = (await client
    .post('auth/locateAccount', {
      json: {
        email,
      },
    })
    .json()) as any;
  return res.emailRegistered;
}

export async function sendVerficationEmail(
  email: string,
  recaptchaResponse: string
): Promise<void> {
  await client.post('auth/flow/email', {
    json: {
      email,
      recaptchaResponse,
    },
  });
}

export async function signOut() {
  await client.post('auth/signOut');
}
