import { createEmailSession, getEmailSession, resetPasswordWithEmailSession } from '@/apis/auth';
import { useAsyncFunction, useNavbarTitle } from '@/hooks';
import { Alert, Box, Button, Center, Code, PasswordInput, Text } from '@mantine/core';
import { hasLength, matchesField, useForm } from '@mantine/form';
import { HTTPError } from 'ky';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { z } from 'zod';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  let { email, flow } = ctx.query;

  if (
    !['register', 'resetPassword'].includes(flow as string) ||
    !z.string().email().safeParse(email).success
  ) {
    return {
      notFound: true,
    };
  }
  return {
    props: {},
  };
};

type FormProps = {
  flow: string;
  email: string;
};

function Form({ flow, email }: FormProps) {
  const isRegistering = flow === 'register';

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: {
      password: hasLength({ min: 6 }, '請設定一個六個字元以上的密碼'),
      confirmPassword: matchesField('password', '與密碼不相符'),
    },
  });
  const { trigger, error, loading } = useAsyncFunction(resetPasswordWithEmailSession);
  const [flowFinished, setFlowFinished] = useState(false);

  const passwordLabel = isRegistering ? '密碼' : '新密碼';
  const sessionExpired = error instanceof HTTPError && error.response.status === 401;
  const expiredWhatToDo = isRegistering ? '開始註冊流程' : '要求重設密碼';
  const expiredMessage = `你所點選的驗證連結已過期。請重新${expiredWhatToDo}。`;

  async function handleFormSubmit() {
    if (sessionExpired) return;
    await trigger(form.values.password);
    setFlowFinished(true);
  }

  if (flowFinished) {
    return (
      <Alert color="green" variant="light" m="md">
        {isRegistering && '密碼設定成功囉！現在就回到網頁或 app 中登入，繼續註冊流程吧！'}
        {!isRegistering && '密碼重設完成。請回到網頁或 app 中，使用你的新密碼登入。'}
      </Alert>
    );
  }

  return (
    <Box m="xl" component="form" onSubmit={form.onSubmit(handleFormSubmit)}>
      {isRegistering && (
        <Text my="sm">
          你正以 <Code>{email}</Code> 註冊新帳號。
        </Text>
      )}
      {!isRegistering && (
        <Text my="sm">
          你正在重設 <Code>{email}</Code> 的密碼。
        </Text>
      )}
      <PasswordInput
        my="sm"
        label={passwordLabel}
        required
        withAsterisk={false}
        description="密碼最少需六個字元"
        {...form.getInputProps('password')}
      />
      <PasswordInput
        my="sm"
        label="確認密碼"
        required
        withAsterisk={false}
        description="請再次輸入欲設定的密碼"
        {...form.getInputProps('confirmPassword')}
      />
      {error && (
        <Alert variant="light" color="red" m="md">
          {!sessionExpired && '無法與伺服器聯繫，請稍後再試。'}
          {sessionExpired && expiredMessage}
        </Alert>
      )}
      {!sessionExpired && (
        <Button type="submit" loading={loading} my="sm">
          繼續
        </Button>
      )}
    </Box>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  let { email: requestedEmail, token, flow } = router.query;
  const title = flow === 'register' ? '註冊新帳號' : '重設密碼';
  useNavbarTitle(title);
  const [errorMessage, setErrorMessage] = useState('');
  const [authenticatedEmail, setAuthenticatedEmail] = useState<string | null>(null);
  const isLoading = !errorMessage && !authenticatedEmail;

  useEffect(() => {
    let canceled;
    (async () => {
      try {
        let session = (await getEmailSession()) as Record<string, any> | null;
        if (canceled) return;
        if (session && session.email === requestedEmail) {
          setAuthenticatedEmail(session.email);
          return;
        }
      } catch (e) {
        setErrorMessage('與伺服器聯繫時發生錯誤，請稍後再試。');
        return;
      }

      try {
        let session = (await createEmailSession(
          requestedEmail as string,
          token as string
        )) as Record<string, any>;
        if (canceled) return;
        setAuthenticatedEmail(session.email);
      } catch (e) {
        if (e instanceof HTTPError && e.response.status === 403) {
          let whatToDo = flow === 'register' ? '開始註冊流程' : '要求重設密碼';
          setErrorMessage(
            `你所點選的驗證連結可能已經使用過、不正確、過期，或是複製不完整。請重新${whatToDo}。`
          );
          return;
        }
        setErrorMessage('與伺服器聯繫時發生錯誤，請稍後再試。');
      }
    })();

    return () => {
      canceled = true;
    };
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      {isLoading && <Center>請稍候</Center>}
      {errorMessage && (
        <Alert color="red" m="md" variant="light">
          {errorMessage}
        </Alert>
      )}
      {authenticatedEmail && <Form flow={flow as string} email={authenticatedEmail} />}
    </>
  );
}

ResetPasswordPage.hideBottomNav = true;
