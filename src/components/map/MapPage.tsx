import { useOs, useViewportSize } from '@mantine/hooks';
import { ActionIcon, Card, Flex, Text } from '@mantine/core';
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
import { Icon, Control } from 'leaflet';
import {
  IconChevronRight,
  IconCurrentLocation,
  IconLocation,
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

type Map =  {
  ID:number
  Name: string,
  Latitude: number,
  Longitude: number,
  Address: string,
  Url: string,
  Phone: string,
  Renew: string,
  User: number
}

function MapPageInner() {
  let { data, error, isLoading } = useSWR(['map/allPos', { throwHttpErrors: true }]);
  if (data && data.length) console.log(data[0]);
  else console.log("error")
  if (error) console.log("error: ", error);

  let fabContainer = useContext(FABContainerContext);
  let initialPlaceId: Number | null = null;
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

  return (
    <>
      {!isLoading && data.map((m:Map) => (
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
            {selectedPlaceId && (
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
                  {data[selectedPlaceId-1].Name}
                </Text>
                <Text>地址 : {data[selectedPlaceId-1].Address}</Text>
                <Text>聯繫方式 : {data[selectedPlaceId-1].Phone}</Text>
                <Text> 網站連結 : <Link href={data[selectedPlaceId-1].Url}> {data[selectedPlaceId-1].Url}</Link></Text>
                <Text>更新時間 : {data[selectedPlaceId-1].Renew.split("T")[0]}</Text>
                <Flex c="blue" mt="md" justify="left">
                  <Text fw={600} size="md">
                    <Link href={`/events/place/${1}`}>查看詳細內容</Link>
                  </Text>

                  <IconChevronRight />
                </Flex>
                <Flex c="blue" mt="md" justify="right">
                  <Text fw={600} size="md">
                    <Link href={`/map/places/${selectedPlaceId}`}>查看詳細內容</Link>
                  </Text>
                  <IconChevronRight />
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
