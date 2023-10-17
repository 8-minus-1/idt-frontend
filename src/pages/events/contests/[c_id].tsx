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
import { Router } from 'next/router';
import isUrl from "is-url";

// pink F8D6D8
// yellow FFE55B

type ModifyContestPage = {
  setFormToShow: (FormType: number) => void
}

type searchData = {
  Name: string,
  Address: string,
  ID: number
}

function ModifyContestPage({setFormToShow}: ModifyContestPage) {
  let c_id = router.query.c_id;

  let { data, error } = useSWR(['cont/contests/'+c_id, { throwHttpErrors: true }]);
  let { data: placeInfo, error:placeInfoError } = useSWR(['map/getInfo?id='+data[0].Place, { throwHttpErrors: true }]);

  const [placeValue, setPlaceValue] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  let { data:s_data, mutate: updateItems} = useSWR<searchData[]>(['map/search/'+searchInput, { throwHttpErrors: true }]);

  if(error) console.log("error: ",error);
  let {trigger, loading} = useAsyncFunction(editContest);

  const form = useForm({
    initialValues: {
      Name: data[0].Name,
      Content: data[0].Content,
      sp_type: data[0].sp_type,//前端送往後端時需處理
      StartDate: new Date(data[0].StartDate),//前端送往後端時需處理
      EndDate: new Date(data[0].EndDate),//前端送往後端時需處理
      Deadline: new Date(data[0].Deadline),
      Url: data[0].Url,
      Other: data[0].Other
    },
  });

  let selectData: any[] = [];
  if(s_data)
  {
    selectData = s_data.map(({ ID, Name }) => ({ value: ID.toString(), label: Name}));
  }

  let defaultSelected = '';
  if(placeInfo)
  {
    if(!selectData.length) selectData.push({ value: String(placeInfo[0].ID), label: "原："+placeInfo[0].Name});
    defaultSelected = selectData[0].value;
    console.log(defaultSelected);
  }

  async function handleSubmit(values: any)
  {
    if(values.sp_type == '')
    {
      notifications.show({
        color: "red",
        title: '沒有選擇運動類別！',
        message: '選擇活動對應的運動，讓他人更快找到你的活動吧！',
      })
      return;
    }
    if(values.Name.length < 5)
    {
      console.log("error: too short")
      notifications.show({
        color: "red",
        title: '比賽名稱至少要有5個字喔～',
        message: '名稱太短大家會不知道這是什麼活動！',
      })
      return;
    }
    if(placeValue == '')
    {
      notifications.show({
        color: "red",
        title: '沒有選擇活動地點！',
        message: '搜尋並選擇活動地點，讓他人更快找到你的活動吧！',
      })
      return;
    }
    //console.log(values,stDate,enDate,deadline)
    if(!values.StartDate || !values.Deadline || !values.EndDate)
    {
      console.log("error: error")
      notifications.show({
        color: "red",
        title: '記得確實填寫日期～',
        message: '讓大家更清楚活動時程！',
      })
      return;
    }
    if(values.Deadline < Date.now())
    {
      notifications.show({
        color: "red",
        title: '歐不！再檢查一次日期～',
        message: 'Oh, no! 報名已經截止了嗎？',
      })
      return;
    }
    if(values.StartDate < values.Deadline)
    {
      console.log("error: error")
      notifications.show({
        color: "red",
        title: '歐不！再檢查一次日期～',
        message: '報名截止日不可以比活動開始日還晚！',
      })
      return;
    }
    if(values.StartDate > values.EndDate)
    {
      console.log("error: error")
      notifications.show({
        color: "red",
        title: '歐不！再檢查一次日期～',
        message: '活動開始日不可以比結束日還要晚！大家不會時空旅行',
      })
      return;
    }
    if(!isUrl(values.Url))
    {
      console.log("error: error")
      notifications.show({
        color: "red",
        title: '請確實填寫報名連結！',
        message: '要有正確的報名連結才會有人報名你的活動喔～',
      })
      return;
    }

    let stDate = values.StartDate.getFullYear()+'-'+(values.StartDate.getMonth()+1)+'-'+values.StartDate.getDate();
    let enDate = values.EndDate.getFullYear()+'-'+(values.EndDate.getMonth()+1)+'-'+values.EndDate.getDate();
    let deadline = values.Deadline.getFullYear()+'-'+(values.Deadline.getMonth()+1)+'-'+values.Deadline.getDate();

    if(loading) return;
    let {error} = await trigger(c_id, values.Name, values.Content, parseInt(placeValue), parseInt(values.sp_type), stDate, enDate, deadline, values.Url, values.Other);
    if(error) return console.error(error);
    notifications.show({
      color: "green",
      title: '更新比賽成功～',
      message: '隨時關注，以獲得最新資訊！',
    })
    setFormToShow(FormType.showContestForm);
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
        {data && (
          <Box maw={500} mx="auto">
            <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
              <Select size={'md'}
                      mt="md" required
                      comboboxProps={{ withinPortal: true }}
                      data={sports}
                      placeholder="請挑選運動類別"
                      label="運動類別"
                      allowDeselect={false}
                      {...form.getInputProps('sp_type')}
              />
              <TextInput size={'md'}
                         mt="md" required
                         label="活動名稱"
                         placeholder="請輸入活動名稱"
                         {...form.getInputProps('Name')}
              />
              <Select size={'md'}
                      mt="md" required
                      label="活動地點"
                      placeholder="請搜尋並選擇活動地點"
                      clearable data={selectData}
                      searchable nothingFoundMessage={"查無地點"}
                      searchValue={searchInput}
                      onSearchChange={(value)=>{
                        console.log(value.length , searchInput.length - 1)
                        if(value.length === searchInput.length - 1)
                        {
                          setPlaceValue('');
                        }
                        setSearchInput(value);
                      }}
                      value={placeValue} onChange={(value:string)=>setPlaceValue((value)? value: '')}
              />
              <DatePickerInput size={'md'}
                               mt="md" required
                               clearable
                               valueFormat="YYYY/MM/DD"
                               label="報名截止日期"
                               placeholder="請選擇報名截止日期"
                               {...form.getInputProps('Deadline')}
              />
              <DatePickerInput size={'md'}
                               mt="md"
                               clearable required
                               valueFormat="YYYY/MM/DD"
                               label="活動開始日期"
                               placeholder="請選擇活動開始日期"
                               {...form.getInputProps('StartDate')}
              />
              <DatePickerInput size={'md'}
                               mt="md" required
                               clearable
                               valueFormat="YYYY/MM/DD"
                               label="活動結束日期"
                               placeholder="請選擇活動結束日期"
                               {...form.getInputProps('EndDate')}
              />
              <Textarea size={'md'}
                        mt="md" radius={'md'}
                        required
                        label="詳細說明"
                        placeholder="關於這個活動詳情"
                        {...form.getInputProps('Content')}
                        minRows={8} autosize
              ></Textarea>
              <TextInput size={'md'}
                         mt="md"
                         required
                         label="官網網址"
                         placeholder="請輸入官方網站網址"
                         {...form.getInputProps('Url')}
              />
              <Textarea size={'md'}
                        mt="md"
                        required
                        minRows={3} autosize
                        label="其他"
                        placeholder="關於這個活動的其他資訊"
                        {...form.getInputProps('Other')}
              />
              <Group justify={"space-evenly"} my={'lg'}>
                <Button
                  onClick={()=>setFormToShow(FormType.showContestForm)}
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
        {error && (
          <Alert color='red'>查無資料</Alert>
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

  let { data, error, mutate:refresh } = useSWR(['cont/contests/'+c_id, { throwHttpErrors: true }]);

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
        router.replace('/events');
        notifications.show({
          color: "green",
          title: '已成功刪除您的活動～',
          message: '期待您隨時來新增活動！',
        });
        //refreshList();
      },
    });
  }
  const titles = {
    [FormType.showContestForm]: '活動詳細資料',
    [FormType.modifyContestForm]: '更改活動資訊'
  };
  const title = titles[formToShow];
  useNavbarTitle(title);

  return (
    <>
      <Head>
        <title>{title}</title>
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
                    <Text size="lg" m='md' fw='700'>活動名稱 : {contest.Name}</Text>
                    <Text ml="xl" mr='lg' size='md' fw={500} style={{whiteSpace: 'pre-wrap'}}>活動內容 : {contest.Content}</Text>
                    <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3}>活動地點 : {contest.Place}</Text>
                    <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3}>報名截止日期 : {contest.Deadline.split("T")[0]}</Text>
                    <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3}>活動開始日期 : {contest.StartDate.split("T")[0]}</Text>
                    <Text ml="xl" mr='lg' size='md' fw={500} mt="md" lineClamp={3}>活動結束日期 : {contest.EndDate.split("T")[0]}</Text>
                    <Text ml="xl" mr='lg' size='md' fw={500} mt="md" style={{whiteSpace: 'pre-wrap'}}>備註 : {contest.Other}</Text>
                    <Link href={contest.Url} target={'_blank'}>
                    <Flex mt='md' justify='right'>
                        <Text fw={600} size='md'>我要報名</Text>
                        <IconChevronRight/>
                    </Flex>
                    </Link>
                </Card>
            )}
            {formToShow === FormType.modifyContestForm && (
              <ModifyContestPage setFormToShow={setFormToShow}></ModifyContestPage>
            )}
            { error &&
            <Alert variant="light" color="red" my="md">
              暫時無法取得資料
            </Alert>
            }
        </Container>
      </main>
    </>
  );
}
