import { useAsyncFunction, useNavbarTitle, useUser } from '@/hooks';
import '@mantine/dates/styles.css';
import Head from 'next/head';
import { tryParse } from '@/utils';
import {
  Alert,
  Box,
  Button,
  Code,
  Container,
  Menu,
  PasswordInput,
  Text,
  TextInput,
  Checkbox,
  Group,
  Select,
  Notification,
  Card,
  Flex,
  ActionIcon,
  Textarea,
} from '@mantine/core';
import { isEmail, useForm } from '@mantine/form';
import { DateInput, DateInputProps, DatePickerInput } from '@mantine/dates';
import { HTTPError } from 'ky';
import Link from 'next/link';
import React, { useContext, useState } from 'react';
import useSWR from 'swr';
import {
  IconDots,
  IconUser,
  IconTrash,
  IconChevronRight,
  IconEdit,
  IconAdjustments,
  IconPlus,
  IconChevronLeft, IconSend,
} from '@tabler/icons-react';
import { FABContainerContext } from '@/contexts/FABContainerContext';
import { createPortal } from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import submit = Simulate.submit;

function AddContestPage({ setFormToShow }: any) {
  const sports = [
    { value: "1", label: "籃球" },
    { value: "2", label: "排球" },
    { value: "3", label: "羽球" },
    { value: "4", label: "網球" },
    { value: "5", label: "游泳" },
    { value: "6", label: "直排輪" },
    { value: "7", label: "足球" },
    { value: "8", label: "桌球" },
    { value: "9", label: "棒球" },
    { value: "10", label: "壘球" },
    { value: "11", label: "躲避球" },
    { value: "12", label: "跆拳道" },
    { value: "13", label: "巧固球" },
    { value: "14", label: "保齡球" },
    { value: "15", label: "其他" },
  ];

  const form = useForm({
    initialValues: {
      Name: '',
      Content: '',
      Place: '',
      sp_type: '',//前端送往後端時需處理
      StartDate: new Date(),//前端送往後端時需處理
      EndDate: '',//前端送往後端時需處理
      Deadline: '',
      Url: '',
      Other: ''
    },
  });

  const dateParser: DateInputProps['dateParser'] = (input) => {
    if (input === 'WW2') {
      return new Date(1939, 8, 1);
    }
    return new Date(input);
  };

  function handleSubmit(values: any) {
    let stDate = '' + values.StartDate.getFullYear() + '-' + (values.StartDate.getMonth() + 1) + '-' + values.StartDate.getDay();
    console.log(stDate)
    setFormToShow(FormType.showContestForm)
  }

  return (
    <Box m="xl">
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <Select size={'md'}
          mt="md"
          comboboxProps={{ withinPortal: true }}
          data={sports}
          placeholder="請挑選運動類別"
          label="運動類別"
          {...form.getInputProps('sp_type')}
        />
        <TextInput size={'md'}
          mt="md"
          withAsterisk
          label="活動名稱"
          placeholder="請輸入活動名稱"
          {...form.getInputProps('Name')}
        />
        <TextInput size={'md'}
          mt="md"
          withAsterisk
          label="地點"
          placeholder="請輸入活動地點"
          {...form.getInputProps('Place')}
        />
        <DatePickerInput size={'md'}
          mt="md"
          withAsterisk
          clearable required
          valueFormat="YYYY/MM/DD"
          label="活動開始日期"
          placeholder="請選擇活動開始日期"
          {...form.getInputProps('StartDate')}
        />
        <DateInput size={'md'}
          mt="md"
          withAsterisk
          clearable
          dateParser={dateParser}
          valueFormat="YYYY/MM/DD"
          label="活動結束日期"
          placeholder="請選擇活動結束日期"
          {...form.getInputProps('EndDate')}
        />
        <DateInput size={'md'}
          mt="md"
          withAsterisk
          clearable
          dateParser={dateParser}
          valueFormat="YYYY/MM/DD"
          label="報名截止日期"
          placeholder="請選擇報名截止日期"
          {...form.getInputProps('Deadline')}
        />
        <Textarea size={'md'}
          mt="md" radius={'md'}
          withAsterisk
          label="詳細說明"
          placeholder="關於這個活動詳情"
          {...form.getInputProps('Content')}
          minRows={8} autosize
        ></Textarea>
        <TextInput size={'md'}
          mt="md"
          withAsterisk
          label="官網網址"
          placeholder="請輸入官方網站網址"
          {...form.getInputProps('Url')}
        />
        <TextInput size={'md'}
          mt="md"
          withAsterisk
          label="其他"
          placeholder="關於這個活動的其他資訊"
          {...form.getInputProps('Other')}
        />
        <Group justify={"space-evenly"} my={'lg'}>
          <Button
            onClick={() => setFormToShow(FormType.showContestForm)}
            leftSection={<IconChevronLeft />}
            w={"45%"}
          >
            取消
          </Button>
          <Button
            type={'submit'}
            variant="gradient"
            gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
            rightSection={<IconSend />}
            w={"45%"} /*loading={loading}*/
          >
            送出
          </Button>
        </Group>
      </form>
    </Box>
  )
}

type ListContestPage = {
  displayByc_id: (c_id: number) => void
  setFormToShow: (FormType: number) => void
};

type Contests = {
  User_id: number,
  Name: string,
  Place: string,
  Content: string,
  sp_type: number,
  StartDate: any,
  EndDate: Date,
  Deadline: string,
  Url: string,
  Other: string,
  c_id: number
}

function ListContestPage({ displayByc_id, setFormToShow }: ListContestPage) {
  const [sp_type, setSp_type] = useState<string | null>('0');
  let str = (sp_type === '0') ? 'cont/contests' : 'cont/contests/SelectType?sp_type=' + sp_type;
  let { data, error } = useSWR([str, { throwHttpErrors: true }]);
  if (data && data.length) console.log(data[0]);
  if (error) console.log("error: ", error);
  let {user} = useUser();

  let {trigger, loading} = useAsyncFunction(deleteAnswer);
  async function handleDelete(q_id:number)
  {
    if(loading) return;
    modals.openConfirmModal({
      title: '您確定要刪除這個回答嗎？',
      centered: true,
      children: (
        <Text size="sm">
          請注意，以上動作沒有辦法復原
        </Text>
      ),
      labels: { confirm: '是的，我非常確定', cancel: "不，請返回" },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await trigger(q_id);
        notifications.show({
          color: "green",
          title: '已成功刪除您的回答～',
          message: '期待您隨時來幫助他人解惑！',
        });
        refreshAnswer();
      },
    });
  }

  const sports = [
    { value: "0", label: "顯示全部活動" },
    { value: "1", label: "籃球" },
    { value: "2", label: "排球" },
    { value: "3", label: "羽球" },
    { value: "4", label: "網球" },
    { value: "5", label: "游泳" },
    { value: "6", label: "直排輪" },
    { value: "7", label: "足球" },
    { value: "8", label: "桌球" },
    { value: "9", label: "棒球" },
    { value: "10", label: "壘球" },
    { value: "11", label: "躲避球" },
    { value: "12", label: "跆拳道" },
    { value: "13", label: "巧固球" },
    { value: "14", label: "保齡球" },
    { value: "15", label: "其他" },
  ];

  return (
    <>
      <main>
        <Container p="lg">
          <Select
            label="運動類別篩選"
            data={sports}
            defaultValue={sports[0].label}
            pb='xl'
            value={sp_type}
            onChange={(value) => (setSp_type(value))}
          />
          {data && data.map((contest: Contests) =>
            <Link href={"events/contests/" + contest.c_id} key={contest.c_id}>
              <Card padding="lg" pb='xl' bg="#D6EAF8" radius="lg" mb='xl' shadow='sm'>
                <Group justify='space-between'>
                  <Group>
                    <IconUser />
                    <Text fw={500} >User{contest.User_id}</Text>
                  </Group>

              { contest.User_id === user?.id &&
                <Menu withinPortal position="bottom-end" shadow="sm">
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray">
                      <IconDots style={{ width: rem(16), height: rem(16) }} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                      color="red"
                      onClick={()=>handleDelete(answer.a_id)}
                    >
                      刪除此回答
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              }

                </Group>
                <Text size="lg" m='md' fw='600'>{contest.Name}</Text>
                <Text ml="xl" mr='lg' size='md' fw={500} lineClamp={3}>{contest.Content}</Text>
                <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3} >報名截止日期 : {contest.Deadline.split("T")[0]}</Text>
                <Link href={contest.Url}>
                  <Flex mt='md' justify='right'>
                    <Text fw={600} size='md'>查看詳細內容</Text>
                    <IconChevronRight />
                  </Flex>
                </Link>
              </Card>
            </Link>
          )}
          {error &&
            <Alert variant="light" color="red" my="md">
              錯誤
            </Alert>
          }
        </Container>
      </main>
    </>
  );
}

type ModifyContestPage = {
  setContestByc_id: (c_id: number) => void
}


function ModifyContestPage({ setContestByc_id }: ModifyContestPage) {
  const [c_id, setc_id] = useState<number | null>(0);
  let { data, error } = useSWR(['cont/contests/'+c_id, { throwHttpErrors: true }]);
  if (error) console.log("error: ", error);

  const sports = [
    { value: "0", label: "顯示全部活動" },
    { value: "1", label: "籃球" },
    { value: "2", label: "排球" },
    { value: "3", label: "羽球" },
    { value: "4", label: "網球" },
    { value: "5", label: "游泳" },
    { value: "6", label: "直排輪" },
    { value: "7", label: "足球" },
    { value: "8", label: "桌球" },
    { value: "9", label: "棒球" },
    { value: "10", label: "壘球" },
    { value: "11", label: "躲避球" },
    { value: "12", label: "跆拳道" },
    { value: "13", label: "巧固球" },
    { value: "14", label: "保齡球" },
    { value: "15", label: "其他" },
  ];

  let form = useForm({
    initialValues: {
      Name: '',
      Content: '',
      Place: '',
      sp_type: '',//前端送往後端時需處理
      StartDate: new Date(),//前端送往後端時需處理
      EndDate: '',//前端送往後端時需處理
      Deadline: '',
      Url: '',
      Other: ''
    },
  });

  return (
    <>
      <main>
        {data && (
          <Box maw={500} mx="auto">
            <form onSubmit={data}>
              <Select
                mt="md"
                comboboxProps={{ withinPortal: true }}
                label="運動類別"
                data={sports}
                defaultValue={data.sp_type}
                {...form.getInputProps('sp_type')}
              />
              <TextInput
                mt="md"
                withAsterisk
                label="活動名稱"
                defaultValue={data.Name}
                {...form.getInputProps('Name')}
              />
              <TextInput
                mt="md"
                withAsterisk
                label="地點"
                defaultValue={data.Place}
                {...form.getInputProps('Place')}
              />
              <DateInput
                mt="md"
                withAsterisk
                clearable defaultValue={new Date()}
                dateParser={data.StartDate}
                valueFormat="YYYY/MM/DD"
                label="開始日期"
                defaultDate={data.StartDate}
                {...form.getInputProps('StartDate')}
              />
              <DateInput
                mt="md"
                withAsterisk
                clearable defaultValue={new Date()}
                dateParser={data.EndDate}
                valueFormat="YYYY/MM/DD"
                label="結束日期"
                defaultDate={data.EndDate}
                {...form.getInputProps('EndData')}
              />
              <DateInput
                mt="md"
                withAsterisk
                clearable defaultValue={new Date()}
                dateParser={data.Deadline}
                valueFormat="YYYY/MM/DD"
                label="截止日期"
                defaultDate={data.Deadline}
                {...form.getInputProps('Deadline')}
              />
              <TextInput
                mt="md"
                withAsterisk
                label="內容"
                defaultValue={data.Content}
                {...form.getInputProps('Content')}
              />
              <TextInput
                mt="md"
                withAsterisk
                label="報名連結"
                defaultValue={data.Url}
                {...form.getInputProps('Url')}
              />
              <TextInput
                mt="md"
                withAsterisk
                label="其他"
                defaultValue={data.Other}
                {...form.getInputProps('Other')}
              />
              <Group justify={"space-evenly"} my={'lg'}>
                <Button
                  onClick={() => { window.location.href = '/event' }}
                  leftSection={<IconChevronLeft />}
                  w={"45%"}
                >
                  取消
                </Button>
                <Button
                  type={'submit'}
                  variant="gradient"
                  gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
                  rightSection={<IconSend />}
                  w={"45%"} /*loading={loading}*/
                >
                  送出
                </Button>
              </Group>
            </form>
          </Box>
        )}
      </main>
    </>
  )
}


enum FormType {
  showContestForm,
  unSignInForm,
  addContestForm,
  modifyContestForm,
}
export default function EventsPage() {
  const [formToShow, setFormToShow] = useState(FormType.showContestForm);

  const titles = {
    [FormType.showContestForm]: '全部活動',
    [FormType.addContestForm]: '新增活動',
    [FormType.modifyContestForm]: '更改活動資訊',
    [FormType.unSignInForm]: '請先登入'
  };

  const [c_id, setc_id] = useState<number | null>(null);
  const title = titles[formToShow];
  useNavbarTitle(title);

  let fabContainer = useContext(FABContainerContext);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        {formToShow === FormType.showContestForm && (
          <Box mx="auto">
            <ListContestPage
              displayByc_id={(c_id) => {
                setc_id(c_id);
              }}
              setFormToShow={(FormType) => {
                setFormToShow(FormType);
              }}
            />
            {fabContainer && createPortal(
              <Button leftSection={<IconPlus size={20} />} mr={'xl'} mb='xl'
                style={({ "box-shadow": 'silver 2px 2px 20px', })} size={'lg'} radius={'xl'} c={"black"} color={'#F8D6D8'} onClick={() => (setFormToShow(FormType.addContestForm))}>
                新增活動
              </Button>
              , fabContainer)
            }
          </Box>
        )}

        {formToShow === FormType.addContestForm && (
          <AddContestPage setFormToShow={setFormToShow}></AddContestPage>
        )}

        {formToShow === FormType.modifyContestForm && (
          <ModifyContestPage setContestByc_id={setc_id} ></ModifyContestPage>
        )}
        {formToShow === FormType.unSignInForm && (
          <Box style={{
            textAlign: "center",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '70vh',
          }}>
            <>
              <Alert color="blue">
                未登入系統，請先登入後再新增活動！
                <Link href='/signin'>按此前往登入頁面</Link>
              </Alert>
            </>
          </Box>
        )}
      </main>
    </>
  );
}
