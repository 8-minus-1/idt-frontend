import { useAsyncFunction, useNavbarTitle, useUser } from '@/hooks';
import Head from 'next/head';
import React, { useState } from 'react';
import {
  Card,
  Container,
  Text,
  Menu,
  Group,
  ActionIcon,
  rem,
  Flex,
  Box,
  Select, Paper, Button, Textarea, TextInput
} from '@mantine/core';
import Link from 'next/link';
import { IconDots, IconUser, IconTrash, IconEdit, IconChevronLeft, IconSend, IconChevronRight} from '@tabler/icons-react';
import useSWR from 'swr';
import { Alert } from '@mantine/core';
import { useRouter } from 'next/router';
import { HTTPError } from 'ky';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { deleteContest, editContest } from '@/apis/cont';
import { DateInput, DateInputProps, DatePickerInput } from '@mantine/dates';
import { isEmail, useForm } from '@mantine/form';

// pink F8D6D8
// yellow FFE55B

type ModifyContestPage = {

}


function ModifyContestPage() {
  const [c_id, setc_id] = useState<number | null>(0);
  let { data, error } = useSWR(['cont/contests/'+c_id, { throwHttpErrors: true }]);
  if(error) console.log("error: ",error);

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
  )}


type Contests = {
    User_id: number,
    Name: string,
    Place: string,
    Content: string,
    sp_type: number,
    StartDate: string,
    EndDate: string,
    Deadline: string,
    Url: string,
    Other: string,
    c_id: number
  }

  enum FormType {
    showContestForm,
    modifyContestForm,
  }
export default function ContestPage(){
  const router = useRouter();
  const c_id = router.query.c_id;
  const [formToShow, setFormToShow] = useState(FormType.showContestForm);

  const titles = {
    [FormType.showContestForm]: '活動詳細資料',
    [FormType.modifyContestForm]: '更改活動資訊',
  };

  let { data, error } = useSWR(['cont/contests/'+c_id, { throwHttpErrors: true }]);

  if(error instanceof HTTPError && error.response.status === 404)
  {
    router.replace('/error');
  }

  let {user} = useUser();
  let {trigger, loading} = useAsyncFunction(deleteContest);
  async function handleDelete(c_id:number)
  {
    if(loading) return;
    modals.openConfirmModal({
      title: '您確定要刪除這個活動嗎？',
      centered: true,
      children: (
        <Text size="sm">
          請注意，以上動作沒有辦法復原
        </Text>
      ),
      labels: { confirm: '是的，我非常確定', cancel: "不，請返回" },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await trigger(c_id);
        notifications.show({
          color: "green",
          title: '已成功刪除您的活動～',
          message: '期待您隨時來新增活動！',
        });
        //refreshList();
      },
    });
  }

  return (
    <>
      <Head>
        <title>{}</title>
      </Head>
      <main>
        <Container p='lg'>
            { formToShow === FormType.showContestForm && data && data.map((contest: Contests) =>
                <Card padding="lg" pb='xl' bg="#D6EAF8" radius="lg" mb='xl' shadow='sm' key={contest.c_id}>
                    <Group justify='space-between'>
                    <Group>
                        <IconUser />
                        <Text fw={500}>User{contest.User_id}</Text>
                    </Group>
                    { contest.User_id == user?.id &&
                    <Menu withinPortal position="bottom-end" shadow="sm">
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDots style={{ width: rem(16), height: rem(16) }} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                      <Menu.Item
                          leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                          color="black"
                          onClick={()=>setFormToShow(FormType.modifyContestForm)}
                        >
                          編輯此活動
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                          color="red"
                          onClick={()=>handleDelete(contest.c_id)}
                        >
                          刪除此活動
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  }
                    </Group>
                    <Text size="lg" m='md' fw='600'>{contest.Name}</Text>
                    <Text ml="xl" mr='lg' size='md' fw={500} style={{whiteSpace: 'pre-wrap'}}>{contest.Content}</Text>
                    <Text ml="xl" mr='lg' size='md' fw={500} mt="md" style={{whiteSpace: 'pre-wrap'}}>{contest.Other}</Text>
                    <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3}>地點 : {contest.Place}</Text>
                    <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3}>時間 : {contest.StartDate.split("T")[0] +" ~ "+ contest.EndDate.split("T")[0]}</Text>
                    <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3}>報名截止日期 : {contest.Deadline.split("T")[0]}</Text>
                    <Link href={contest.Url}>
                    <Flex mt='md' justify='right'>
                        <Text fw={600} size='md'>我要報名</Text>
                        <IconChevronRight/>
                    </Flex>
                    </Link>
                </Card>
            )}
            {formToShow === FormType.modifyContestForm && (
              <ModifyContestPage></ModifyContestPage>
            )}
            { error &&
            <Alert variant="light" color="red" my="md">
              暫時無法取得資料
            </Alert>
            }
          { !error }
        </Container>
      </main>
    </>
  );
}
