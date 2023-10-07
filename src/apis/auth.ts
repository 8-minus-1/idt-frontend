import { HTTPError } from 'ky';
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

export async function getEmailSession() {
  try {
    return await client.get('auth/flow/email/session').json();
  } catch (e) {
    if (e instanceof HTTPError && e.response.status === 401) {
      return null;
    }
    throw e;
  }
}

export async function createEmailSession(email: string, token: string) {
  return await client
    .post('auth/flow/email/session', {
      json: {
        email,
        token,
      },
    })
    .json();
}

export async function resetPasswordWithEmailSession(newPassword: string) {
  return await client.post('auth/flow/email/resetPassword', {
    json: {
      password: newPassword,
    },
  });
}
