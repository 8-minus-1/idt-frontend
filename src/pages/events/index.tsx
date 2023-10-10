import { useNavbarTitle } from '@/hooks';
import '@mantine/dates/styles.css';
import Head from 'next/head';
import { tryParse } from '@/utils';
import { Alert, Box, Button, Code, PasswordInput, Text, TextInput,Checkbox,  Group, Select,Notification } from '@mantine/core';
import { isEmail, useForm } from '@mantine/form';
import { DateInput, DateInputProps } from '@mantine/dates';
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
  const [formToShow, setFormToShow] = useState(FormType.addContestForm);
  const titles = {
    [FormType.showContestForm]: '全部比賽',
    [FormType.addContestForm]: '新增比賽',
    [FormType.modifyContestForm]: '更改比賽資訊',
    [FormType.unSignInForm]: '請先登入'
  };
  const title = titles[formToShow];
  useNavbarTitle(title);
  
//add
  const form = useForm({
    initialValues: {
      Name: '',
      Content:'',
      Place:'',
      sp_type:'',//前端送往後端時需處理
      StartDate:'',//前端送往後端時需處理
      EndDate:'',//前端送往後端時需處理
      Url:'',
      Other:''
    },
  });

  async function ifSuccess() {
    if(true)//到時要在加條件
      alert("比賽新增成功!")
    setFormToShow(FormType.showContestForm)
  }

  const dateParser: DateInputProps['dateParser'] = (input) => {
    if (input === 'WW2') {
      return new Date(1939, 8, 1);
    }
    return new Date(input);
  };
//add
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        {formToShow === FormType.showContestForm}

        {formToShow === FormType.addContestForm &&(
          <Box maw={340} mx="auto">
            <form onSubmit={form.onSubmit((values) => console.log(values))}>
              <TextInput
              mt="md"
                withAsterisk
                label="賽事名稱"
                placeholder="請輸入賽事名稱"
                {...form.getInputProps('Name')}
              />
              <TextInput
              mt="md"
                withAsterisk
                label="內容"
                placeholder="請輸入相關內容"
                {...form.getInputProps('Content')}
              />
              <TextInput
              mt="md"
                withAsterisk
                label="地點"
                placeholder="請輸入比賽地點"
                {...form.getInputProps('Place')}
              />
              <Select
                mt="md"
                comboboxProps={{ withinPortal: true }}
                data={['ALL', '籃球', '排球', '網球','游泳', '直排輪', '足球', '桌球','棒球', '壘球', '躲避球', '跆拳道','巧固球', '保齡球', '其他']}
                placeholder="請挑選比賽類別"
                label="比賽類別"
                
                {...form.getInputProps('sp_type')}
              />
              <DateInput
              mt="md" 
                withAsterisk
                clearable defaultValue={new Date()}
                dateParser={dateParser}
                valueFormat="YYYY/MM/DD"
                label="開始日期"
                placeholder="請選擇比賽開始日期"
                {...form.getInputProps('StartDate')}
              />
              <DateInput 
              mt="md"
                withAsterisk
                clearable defaultValue={new Date()}
                dateParser={dateParser}
                valueFormat="YYYY/MM/DD"
                label="結束日期"
                placeholder="請選擇比賽結束日期"
                {...form.getInputProps('EndDate')}
              />
              <TextInput
              mt="md"
                withAsterisk
                label="報名連結"
                placeholder="請輸入報名連結"
                {...form.getInputProps('Url')}
              />
              <TextInput
              mt="md"
                withAsterisk
                label="其他"
                placeholder="其他資訊"
                {...form.getInputProps('Other')}
              />
              <Group justify="flex-end" mt="md">
                <Button type="submit" onClick={ifSuccess}>確定</Button>
              </Group>
            </form>
          </Box>
        )}
        
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
