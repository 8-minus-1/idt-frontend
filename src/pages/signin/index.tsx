import { isEmailRegistered, sendVerficationEmail, signIn } from '@/apis/auth';
import { useAsyncFunction, useNavbarTitle } from '@/hooks';
import { getRecaptchaToken, tryParse } from '@/utils';
import { Alert, Box, Button, Code, PasswordInput, Text, TextInput } from '@mantine/core';
import { isEmail, useForm } from '@mantine/form';
import { HTTPError } from 'ky';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

type EmailFormProps = {
  setRegisteredEmail: (email: string) => void;
  setUnregisteredEmail: (email: string) => void;
};

function EmailForm({ setRegisteredEmail, setUnregisteredEmail }: EmailFormProps) {
  const emailForm = useForm({
    initialValues: {
      email: '',
    },
    transformValues({ email }) {
      return { email: email.trim() };
    },
    validate: {
      email: isEmail('電子郵件地址格式不正確'),
    },
  });
  let { trigger, loading, error } = useAsyncFunction(isEmailRegistered);

  async function handleEmailFormSubmit() {
    if (loading) return;
    let { email } = emailForm.values;
    let { data: registered, error } = await trigger(email);
    if (error) return console.error(error);
    if (registered) {
      setRegisteredEmail(email);
    } else {
      setUnregisteredEmail(email);
    }
  }
  return (
    <Box m="xl" component="form" onSubmit={emailForm.onSubmit(handleEmailFormSubmit)}>
      <TextInput
        label="電子郵件地址"
        type="email"
        required
        withAsterisk={false}
        {...emailForm.getInputProps('email')}
      />
      <Text size="sm" my="md" mb="0">
        繼續操作即表示你已詳閱且同意遵守<Link href="/privacy">服務條款與隱私權政策</Link>。
      </Text>
      <Text size="sm" my="md" mt="xs">
        本服務使用 reCAPTCHA 技術。繼續操作即表示你同意 Google 的
        <a target="_blank" href="https://policies.google.com/terms">服務條款</a>與
        <a target="_blank" href="https://policies.google.com/privacy">隱私權政策</a>。
      </Text>
      {error && (
        <Alert variant="light" color="red" my="md">
          無法與伺服器聯繫，請稍後再試。
        </Alert>
      )}
      <Button type="submit" loading={loading}>
        繼續
      </Button>
    </Box>
  );
}

type SignUpFormProps = {
  email: string;
  onChangeEmail: () => void;
};

function SignUpForm({ email, onChangeEmail }: SignUpFormProps) {
  let { trigger, loading, error } = useAsyncFunction(sendVerficationEmail);

  let [emailSent, setEmailSent] = useState(false);

  async function handleSendEmail() {
    if (loading) return;
    let token = await getRecaptchaToken();
    if (!token) return;
    let { error } = await trigger(email, token);
    if (error) return console.error(error);
    setEmailSent(true);
  }

  let rateLimited = error instanceof HTTPError && error.response.status === 429;
  let recaptchaError = error instanceof HTTPError && error.response.status === 403;
  let errorMessage = rateLimited
    ? '驗證信寄送太過頻繁，請稍後再試。'
    : recaptchaError
      ? 'reCAPTCHA 驗證失敗，請再試一次。'
      : '無法與伺服器聯繫，請稍後再試。';

  return (
    <Box m="xl">
      {!emailSent && (
        <>
          <Text size="sm" my="md">
            點選「寄送驗證信」後，系統將傳送一封含有註冊連結的郵件至 <Code>{email}</Code>
            ，供你繼續完成註冊流程。
          </Text>
          <Text size="sm" my="md">
            提醒您，必須完成簡訊驗證後才算完成會員註冊。
          </Text>
          <Text size="sm" my="md">
            <a onClick={onChangeEmail}>打錯電子郵件地址了嗎？點選重填</a>
          </Text>
          <Text size="sm" my="md">
            繼續操作即表示你已詳閱且同意遵守<Link href="/privacy">服務條款與隱私權政策</Link>。
          </Text>
          {error && (
            <Alert variant="light" color="red" my="md">
              {errorMessage}
            </Alert>
          )}
          <Button loading={loading} onClick={handleSendEmail}>
            寄送驗證信
          </Button>
        </>
      )}
      {emailSent && (
        <>
          <Alert color="green" my="md">
            系統已傳送一封含有註冊連結的郵件至 <Code>{email}</Code>
            ，請點選信中連結繼續完成註冊流程。
          </Alert>
          <Link href="/">回首頁</Link>
        </>
      )}
    </Box>
  );
}

type SignInFormProps = {
  email: string;
  onChangeEmail: () => void;
  showResetPasswordForm: () => void;
};

function SignInForm({ email, onChangeEmail, showResetPasswordForm }: SignInFormProps) {
  const form = useForm({
    initialValues: {
      password: '',
    },
  });
  let { trigger, loading } = useAsyncFunction(signIn);
  const router = useRouter();
  let [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleEmailFormSubmit() {
    if (loading) return;
    setErrorMessage(null);
    let { password } = form.values;
    let token = await getRecaptchaToken();
    if (!token) return setErrorMessage('無法與伺服器聯繫，請稍後再試。');
    let { error } = await trigger(email, password, token);
    if (error) {
      if (error instanceof HTTPError && error.response.status === 403) {
        let parsed = tryParse(await error.response.text());
        if (parsed && parsed.error) {
          if (parsed.error === 'invalidCredentials') {
            form.setFieldError('password', '密碼錯誤');
            return;
          }
          if (parsed.error === 'recaptchaError') {
            setErrorMessage('reCAPTCHA 驗證失敗，請再試一次。');
            return;
          }
        }
      }
      setErrorMessage('無法與伺服器聯繫，請稍後再試。');
      return console.error(error);
    }
    router.replace('/more');
  }

  return (
    <Box m="xl" component="form" onSubmit={form.onSubmit(handleEmailFormSubmit)}>
      <Text size="sm" my="md">
        輸入 <Code>{email}</Code> 的密碼。
      </Text>
      <Text size="sm" my="md">
        <a onClick={onChangeEmail}>打錯電子郵件地址了嗎？點選重填</a>
      </Text>
      <PasswordInput
        label="密碼"
        required
        withAsterisk={false}
        {...form.getInputProps('password')}
        autoFocus={true}
      />
      {errorMessage && (
        <Alert variant="light" color="red" my="md">
          {errorMessage}
        </Alert>
      )}
      <Button type="submit" loading={loading} my="md">
        登入
      </Button>
      <Text size="sm" my="md">
        <a onClick={showResetPasswordForm}>忘記密碼？</a>
      </Text>
    </Box>
  );
}

type ResetPasswordFormProps = {
  email: string;
  onChangeEmail: () => void;
};

function ResetPasswordForm({ email, onChangeEmail }: ResetPasswordFormProps) {
  let { trigger, loading, error } = useAsyncFunction(sendVerficationEmail);

  let [emailSent, setEmailSent] = useState(false);

  async function handleSendEmail() {
    if (loading) return;
    let token = await getRecaptchaToken();
    if (!token) return;
    let { error } = await trigger(email, token);
    if (error) return console.error(error);
    setEmailSent(true);
  }

  let rateLimited = error instanceof HTTPError && error.response.status === 429;
  let errorMessage = rateLimited
    ? '驗證信寄送太過頻繁，請稍後再試。'
    : '無法與伺服器聯繫，請稍後再試。';

  return (
    <Box m="xl">
      {!emailSent && (
        <>
          <Text size="md" my="md">
            <a onClick={onChangeEmail}>← 取消</a>
          </Text>
          <Text size="sm" my="md">
            點選「寄送重設密碼驗證信」後，系統將傳送一封含有密碼重設連結的郵件至{' '}
            <Code>{email}</Code>。
          </Text>
          {error && (
            <Alert variant="light" color="red" my="md">
              {errorMessage}
            </Alert>
          )}
          <Button loading={loading} onClick={handleSendEmail}>
            寄送重設密碼驗證信
          </Button>
        </>
      )}
      {emailSent && (
        <>
          <Alert color="green" my="md">
            系統已傳送一封含有密碼重設連結的郵件至 <Code>{email}</Code>
            ，請點選信中連結以設定新密碼。
          </Alert>
          <Link href="/">回首頁</Link>
        </>
      )}
    </Box>
  );
}

enum FormType {
  EmailForm,
  SignUpForm,
  SignInForm,
  ResetPasswordForm,
}

export default function SignInPage() {
  const [formToShow, setFormToShow] = useState(FormType.EmailForm);
  const titles = {
    [FormType.EmailForm]: '登入/註冊',
    [FormType.SignUpForm]: '註冊新帳號',
    [FormType.SignInForm]: '登入',
    [FormType.ResetPasswordForm]: '重設密碼',
  };
  const title = titles[formToShow];
  useNavbarTitle(title);
  const [email, setEmail] = useState<string | null>(null);

  function resetPage() {
    setEmail(null);
    setFormToShow(FormType.EmailForm);
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        {formToShow === FormType.EmailForm && (
          <EmailForm
            setRegisteredEmail={(email) => {
              setEmail(email);
              setFormToShow(FormType.SignInForm);
            }}
            setUnregisteredEmail={(email) => {
              setEmail(email);
              setFormToShow(FormType.SignUpForm);
            }}
          />
        )}
        {formToShow === FormType.SignUpForm && (
          <SignUpForm email={email!} onChangeEmail={resetPage} />
        )}
        {formToShow === FormType.SignInForm && (
          <SignInForm
            email={email!}
            onChangeEmail={resetPage}
            showResetPasswordForm={() => setFormToShow(FormType.ResetPasswordForm)}
          />
        )}
        {formToShow === FormType.ResetPasswordForm && (
          <ResetPasswordForm
            email={email!}
            onChangeEmail={() => setFormToShow(FormType.SignInForm)}
          />
        )}
      </main>
    </>
  );
}
