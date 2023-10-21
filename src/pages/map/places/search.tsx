import { useNavbarTitle } from '@/hooks';
import { Alert, Center, Divider, Group, Stack, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconChevronRight } from '@tabler/icons-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { useState } from 'react';
import useSWR from 'swr';
import qs from 'querystring';

type PlaceSearchResult = {
  ID: string;
  Name: string;
  Address: string;
  Latitude: number;
  Longitude: number;
};

export default function SearchPlacePage() {
  useNavbarTitle('搜尋場館');
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 200);
  const pattern = debounced.trim();
  const {
    data: places,
    isLoading,
    error,
  } = useSWR<PlaceSearchResult[]>(pattern ? `map/search/${encodeURIComponent(pattern)}` : null);
  const isInitialFetch = !places && isLoading;

  return (
    <>
      <Head>
        <title>搜尋場館</title>
      </Head>
      <Stack pb="md" style={{ flex: 1 }} gap="0">
        <TextInput
          bg="var(--color-page-background)"
          p="md"
          label="搜尋地點名稱"
          autoFocus
          value={search}
          onInput={(e) => setSearch(e.currentTarget.value)}
          style={{ position: 'sticky', top: '48px', boxShadow: '0px 1px 5px 0px rgb(0 0 0 / 10%' }}
        />
        {error && (
          <Alert variant="light" color="red" m="md">
            無法取得搜尋結果，請稍後再試。
          </Alert>
        )}
        {!pattern && <Center style={{ flex: 1 }}>搜尋結果會顯示在這裡。</Center>}
        {isInitialFetch && <Center style={{ flex: 1 }}>正在搜尋場館⋯</Center>}
        {places && !places.length && <Center style={{ flex: 1 }}>找不到符合名稱的場館。</Center>}
        {!error && places && !!places.length && (
          <Stack style={{ flex: 1 }} gap="0">
            {places.map((place) => {
              const handleNav = () => {
                router.replace({
                  pathname: '/map',
                  hash: qs.stringify(
                    { pid: place.ID, x: place.Longitude, y: place.Latitude, z: 17 },
                    ';'
                  ),
                });
              };
              return (
                <React.Fragment key={place.ID}>
                  <Group
                    justify="space-between"
                    bg="white"
                    px="md"
                    py="sm"
                    tabIndex={0}
                    onClick={handleNav}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter') handleNav();
                    }}
                  >
                    <Stack gap="0">
                      <Text fw="bold">{place.Name}</Text>
                      <Text>{place.Address}</Text>
                    </Stack>
                    <IconChevronRight />
                  </Group>
                  <Divider />
                </React.Fragment>
              );
            })}
          </Stack>
        )}
      </Stack>
    </>
  );
}
