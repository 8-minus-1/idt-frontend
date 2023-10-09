import { useNavbarTitle } from '@/hooks';
import Head from 'next/head';
import { tryParse } from '@/utils';
import { Alert, Box, Button, Code, PasswordInput, Text, TextInput } from '@mantine/core';
import { isEmail, useForm } from '@mantine/form';
import { HTTPError } from 'ky';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

enum FormType {
  showContestForm,
  unSignInForm,
  addContestForm,
  modifyContestForm,
}
export default function EventsPage() {
  const [formToShow, setFormToShow] = useState(FormType.unSignInForm);
  const titles = {
    [FormType.showContestForm]: '全部比賽',
    [FormType.addContestForm]: '新增比賽',
    [FormType.modifyContestForm]: '更改比賽資訊',
    [FormType.unSignInForm]: '請先登入'
  };
  const title = titles[formToShow];

  useNavbarTitle(title);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        {formToShow === FormType.showContestForm}

        {formToShow === FormType.addContestForm}

        {formToShow === FormType.modifyContestForm}
                
        {formToShow === FormType.unSignInForm && (
          <Box style={{
            textAlign: "center",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
          }}>
          {(
            <>
              <Alert color="blue">
                未登入系統，請先登入後再新增比賽!
              <Link href = '/more'>按此前往登入頁面</Link>
              </Alert>
            </>
          )}
          </Box>
        )}
      </main>
    </>
  );
}
