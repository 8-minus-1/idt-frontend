import { useViewportSize } from '@mantine/hooks';
import { Card, Flex, rem, Text } from '@mantine/core';
import React, { useContext, useEffect, useState } from 'react';
import {
  MapContainer,
  MapContainerProps,
  Marker,
  Popup,
  TileLayer,
  TileLayerProps,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { Icon, Control } from 'leaflet';
import { IconChevronRight } from '@tabler/icons-react';
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

function MapPageInner() {
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

  const [selectedPlaceId, setSelectedPlaceId] = useState<Number | null>(initialPlaceId);
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

  const places = [
    {
      ID: 1234,
      Name: '元智大學',
      Latitude: 24.97021049841728,
      Longitude: 121.2634609147969,
    },
    {
      ID: 1239,
      Name: '元智大學鐵欄杆',
      Latitude: 24.96512372296235,
      Longitude: 121.26732568588233,
    },
  ];

  useMapEvents({
    zoomend: encodeMapStateIntoUrl,
    moveend: encodeMapStateIntoUrl,
    click() {
      setSelectedPlaceId(null);
    },
  });

  useEffect(() => {
    encodeMapStateIntoUrl();
  }, [selectedPlaceId]);

  return (
    <>
      {places.map(({ ID, Name, Latitude, Longitude }) => (
        <Marker
          key={ID}
          position={{ lat: Latitude, lng: Longitude }}
          icon={selectedPlaceId === ID ? SelectedIcon : DefaultIcon}
          eventHandlers={{
            click: (e) => {
              map.flyTo([Latitude, Longitude], 17);
              setSelectedPlaceId(ID);
            },
          }}
        />
      ))}
      {selectedPlaceId &&
        fabContainer &&
        createPortal(
          <div style={{ zIndex: 1, position: 'absolute', bottom: 0, width: '100%' }}>
            <Card padding="lg" px="xl" bg="#F2FAFC" radius="lg" m="lg" shadow="sm">
              <Text fw="700" size="xl">
                元智大學
              </Text>
              <Text>地址 : 320桃園市中壢區遠東路135號</Text>
              <Text>聯繫方式 : 034638800</Text>
              <Text>網站連結 : https://www.yzu.edu.tw/</Text>
              <Text>更新時間 : 2023-10-18</Text>
              <Flex c="blue" mt="md" justify="right">
                <Text fw={600} size="md">
                  <Link href={`/map/places/${selectedPlaceId}`}>查看詳細內容</Link>
                </Text>
                <IconChevronRight />
              </Flex>
            </Card>
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
