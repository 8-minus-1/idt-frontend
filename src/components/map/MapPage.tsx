import { useOs, useViewportSize } from '@mantine/hooks';
import { ActionIcon, Card, Flex, Rating, rem, Text, UnstyledButton } from '@mantine/core';
import React, { useContext, useEffect, useState } from 'react';
import {
  MapContainer,
  MapContainerProps,
  Marker,
  TileLayer,
  TileLayerProps,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { Control, Icon } from 'leaflet';
import {
  IconChevronRight,
  IconCurrentLocation,
  IconKarate,
  IconLocation,
  IconMap,
  IconPhone,
  IconPingPong,
  IconRun,
  IconSearch,
} from '@tabler/icons-react';
import { FABContainerContext } from '@/contexts/FABContainerContext';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/router';
import qs from 'querystring';

import LeafletMarker from 'leaflet/dist/images/marker-icon.png';
import LeafletMarker2x from 'leaflet/dist/images/marker-icon-2x.png';
import LeafletMarkerShadow from 'leaflet/dist/images/marker-shadow.png';
import SelectedMarker from '@/assets/marker-icon-selected.png';
import SelectedMarker2x from '@/assets/marker-icon-selected-2x.png';
import Link from 'next/link';
import { notifications } from '@mantine/notifications';
import useSWR from 'swr';
import { NavbarRightSlotContext } from '@/contexts/NavbarRightSlotContext';
import {
  Badminton,
  BaseballBat,
  Basketball,
  Bowling,
  Football,
  PlayBasketball,
  Rollerskates,
  Soccer,
  Softball,
  SwimmingPool,
  Tennis,
  Volleyball,
} from '@icon-park/react';

Icon.Default.prototype.options.iconUrl = LeafletMarker.src;
Icon.Default.prototype.options.iconRetinaUrl = LeafletMarker2x.src;
Icon.Default.prototype.options.shadowUrl = LeafletMarkerShadow.src;
Icon.Default.prototype.options.shadowRetinaUrl = LeafletMarkerShadow.src;
Control.Attribution.prototype.options.prefix = 'Leaflet';

const mapProps: MapContainerProps = {
  center: [24.97294, 121.25822],
  zoom: 15,
  maxZoom: 18,
};
const tileLayerProps: TileLayerProps = {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
  url: 'https://apis.verylowmaint.com/osm/tile{r}/{z}/{x}/{y}.png',
};
const SelectedIcon = new Icon({
  iconUrl: SelectedMarker.src,
  iconRetinaUrl: SelectedMarker2x.src,
  shadowUrl: LeafletMarkerShadow.src,
  shadowRetinaUrl: LeafletMarkerShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
const DefaultIcon = new Icon.Default();

function Resizer() {
  const map = useMap();
  const { height } = useViewportSize();
  useEffect(() => {
    if (map) {
      map.invalidateSize();
    }
  }, [map, height]);

  return <></>;
}

function LeafletContainerStyle() {
  const { height } = useViewportSize();
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
      .leaflet-container {
        height: ${height - 64 - 48}px;
        z-index:0;
      }
    `,
      }}
    />
  );
}

function HashParamsLoader() {
  const router = useRouter();
  const map = useMap();

  useEffect(() => {
    if (!router.isReady) return;
    const url = new URL(location.href);

    if (url.hash) {
      const { z, x, y } = qs.parse(url.hash.slice(1), ';');
      const zoom = Number(z);
      const lng = Number(x);
      const lat = Number(y);
      if (Number.isNaN(lng) || Number.isNaN(lat) || Number.isNaN(zoom)) return;
      if (zoom < map.getMinZoom() || zoom > map.getMaxZoom()) return;
      map.setView([lat, lng], zoom);
    }
  }, [router.isReady]);

  return <></>;
}

type Map = {
  ID: number;
  Name: string;
  Latitude: number;
  Longitude: number;
  Address: string;
  Url: string;
  Phone: string;
  Renew: string;
  User: number;
  Rank: number;
  sports: any[],
  opentime: any
};

function MapPageInner() {
  let { data: places, error } = useSWR<Map[]>(['map/allPos']);
  if (places && places.length) console.log(places[0]);
  else console.log('error');
  if (error) console.log('error: ', error);

  const fabContainer = useContext(FABContainerContext);
  const navbarRightSlot = useContext(NavbarRightSlotContext);

  let initialPlaceId: number | null = null;
  const url = new URL(location.href);
  if (url.hash) {
    const { pid } = qs.parse(url.hash.slice(1), ';');
    const parsed = Number(pid);
    if (!Number.isNaN(parsed)) {
      initialPlaceId = parsed;
    }
  }

  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(initialPlaceId);
  const map = useMap();
  const router = useRouter();

  function encodeMapStateIntoUrl() {
    if (!router.isReady) return;
    const params: any = {
      z: map.getZoom(),
      x: map.getCenter().lng,
      y: map.getCenter().lat,
    };
    if (selectedPlaceId) {
      params.pid = selectedPlaceId;
    }

    router
      .replace(
        {
          hash: qs.stringify(params, ';'),
        },
        undefined,
        { shallow: true }
      )
      .catch((e) => {
        if (!e.cancelled) throw e;
      });
  }

  function handleLocate() {
    setSelectedPlaceId(null);
    map.locate({ enableHighAccuracy: true, setView: true });
  }

  function handleSearch() {
    router.push('/map/places/search');
  }

  useMapEvents({
    zoomend: encodeMapStateIntoUrl,
    moveend: encodeMapStateIntoUrl,
    click() {
      setSelectedPlaceId(null);
    },
    locationerror(event) {
      let message = '無法取得目前位置。';
      if (event.code === 0) {
        message = '此瀏覽器或裝置不支援定位功能。';
      } else if (event.code === 1) {
        message = '允許網頁取得定位權限後才能定位。';
      }
      notifications.clean();
      notifications.show({
        color: 'red',
        message,
      });
    },
  });

  useEffect(() => {
    encodeMapStateIntoUrl();
  }, [selectedPlaceId]);

  const os = useOs();
  const LocationIcon = os === 'ios' || os === 'macos' ? IconLocation : IconCurrentLocation;

  const selectedPlace = selectedPlaceId !== null && places?.find(place => place.ID === selectedPlaceId);

  const icons = [
    <></>,
    <Basketball theme="outline" size="24" fill="#333" key={1}/>,
    <Volleyball theme="outline" size="24" fill="#333" key={2}/>,
    <Badminton theme="outline" size="24" fill="#333" key={3}/>,
    <Tennis theme="outline" size="24" fill="#333" key={4}/>,
    <SwimmingPool theme="outline" size="24" fill="#333" key={5}/>,
    <Rollerskates theme="outline" size="24" fill="#333" key={6}/>,
    <Football theme="outline" size="24" fill="#333" key={7}/>,
    <IconPingPong key={8}/>,
    <BaseballBat theme="outline" size="24" fill="#333" key={9}/>,
    <Softball theme="outline" size="24" fill="#333" key={10} />,
    <PlayBasketball theme="outline" size="24" fill="#333" key={11}/>,
    <IconKarate key={12}/>,
    <Soccer theme="outline" size="24" fill="#333" key={13}/>,
    <Bowling theme="outline" size="24" fill="#333" key={14}/>
  ]

  let getOpen = 0;
  let Now = new Date().getDay();
  let NowTime = new Date(new Date(Date.now()).toString());
  if(selectedPlace)
  {
    let open_str = selectedPlace.opentime[(Now*2-1)+''].split(':');
    let close_str = selectedPlace.opentime[(Now*2)+''].split(':');
    let open = new Date();
    let close=new Date();
    open.setHours(parseInt(open_str[0]), parseInt(open_str[1]),parseInt(open_str[2]));
    close.setHours(parseInt(close_str[0]), parseInt(close_str[1]),parseInt(close_str[2]));

    console.log(open);
    console.log(close);
    if(open > NowTime || close < NowTime)
      getOpen = 0;//close
    else if(open < NowTime && close > NowTime)
      getOpen = 1;//open
    console.log(getOpen);
  }

  return (
    <>
      {navbarRightSlot &&
        createPortal(
          <UnstyledButton px="sm" lh="1" display="block" ml="auto" h="100%" onClick={handleSearch}>
            <IconSearch />
          </UnstyledButton>,
          navbarRightSlot
        )}
      {places &&
        places.map((m) => (
          <Marker
            key={m.ID}
            position={{ lat: m.Latitude, lng: m.Longitude }}
            icon={selectedPlaceId === m.ID ? SelectedIcon : DefaultIcon}
            eventHandlers={{
              click: (e) => {
                map.flyTo([m.Latitude, m.Longitude], 17);
                setSelectedPlaceId(m.ID);
              },
            }}
          />
        ))}
      {fabContainer &&
        createPortal(
          <div
            style={{
              zIndex: 1,
              position: 'absolute',
              bottom: 0,
              width: '100%',
              pointerEvents: 'none',
            }}
          >
            <Flex justify="flex-end">
              <ActionIcon
                size="xl"
                variant="default"
                m="md"
                mb={selectedPlaceId ? '0' : 'xl'}
                style={{ pointerEvents: 'auto' }}
                onClick={handleLocate}
              >
                <LocationIcon style={{ width: '60%', height: '60%' }} />
              </ActionIcon>
            </Flex>
            {selectedPlace && (
              <Card
                padding="lg"
                px="xl"
                bg="#F2FAFC"
                radius="lg"
                m="lg"
                shadow="sm"
                style={{ pointerEvents: 'auto' }}
              >
                <Text fw="700" size="xl">
                  {selectedPlace.Name}
                </Text>
                <Text size='sm' >
                  營業時間：今天 {(selectedPlace.opentime[(Now*2-1)+'']).split(':')[0]+':'+(selectedPlace.opentime[(Now*2-1)+'']).split(':')[1]} ~ {(selectedPlace.opentime[(Now*2)+'']).split(':')[0] + ':' + (selectedPlace.opentime[(Now*2)+'']).split(':')[1] }
                  {getOpen === 0 &&
                    <>（已打烊）</>
                  }
                  {getOpen === 1 &&
                    <>（營業中）</>
                  }
                </Text>
                <Flex mt={'xs'}>
                  <IconMap />
                  <Text ml={'xs'}>地址：{selectedPlace.Address}</Text>
                </Flex>
                <Flex mt={'xs'}>
                  <IconPhone />
                  <Text ml={'xs'}>聯絡電話：{selectedPlace.Phone}</Text>
                </Flex>
                <Flex mt={'xs'}>
                  <IconRun />
                  <Text ml={'xs'}>提供運動：</Text>
                  {selectedPlace.sports.map( (item:any, index: number) => (
                    <Flex ml={'xs'} key={index} >
                      { index !== 0 && '、'}
                      {icons[item.sp_type]}
                      <Text ml={'xs'} size={'md'}>{item.sp_name}</Text>
                    </Flex>
                  ))}
                </Flex>
                {
                  //TODO: 有幾個人評價
                  //TODO: 是否免費
                }

                <Flex mt="md" justify="space-between">
                  <Flex>
                    {selectedPlace.Rank === 0 && <Text>尚未有評價！</Text>}
                    {selectedPlace.Rank != 0 && <>
                      {selectedPlace.Rank}
                      <Rating ml={'xs'} pt={rem(2)} value={selectedPlace.Rank} fractions={10} readOnly /></>
                    }
                  </Flex>
                  <Flex mt={rem(2)}>
                    <Text c="blue" fw={600} size="md">
                      <Link href={`/map/places/${selectedPlaceId}`}>查看詳細內容</Link>
                    </Text>
                    <IconChevronRight color={'blue'}/>
                  </Flex>
                </Flex>
              </Card>
            )}
          </div>,
          fabContainer
        )}
    </>
  );
}

export default function MapPage() {
  return (
    <>
      <LeafletContainerStyle />
      <MapContainer {...mapProps}>
        <HashParamsLoader />
        <Resizer />
        <TileLayer {...tileLayerProps} />
        <MapPageInner />
      </MapContainer>
    </>
  );
}
