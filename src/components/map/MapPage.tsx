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
  const [displayState, setDisplayState] = useState(0);
  const map = useMap();
  const router = useRouter();

  function handleZoomAndCenterChange() {
    if (!router.isReady) return;
    const params = {
      z: map.getZoom(),
      x: map.getCenter().lng,
      y: map.getCenter().lat,
    };

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

  useMapEvents({
    zoomend: handleZoomAndCenterChange,
    moveend: handleZoomAndCenterChange,
  });

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

  return (
    <>
      {places.map(({ ID, Name, Latitude, Longitude }) => (
        <Marker
          key={ID}
          position={{ lat: Latitude, lng: Longitude }}
          eventHandlers={{
            click: (e) => {
              setDisplayState(1);
            },
          }}
        >
          <Popup>{Name}</Popup>
        </Marker>
      ))}
      {displayState &&
        fabContainer &&
        createPortal(
          <Card
            w="100%"
            padding="lg"
            px="xl"
            bg="#F2FAFC"
            radius="lg"
            mb="xl"
            shadow="sm"
            style={{ zIndex: 1, position: 'absolute', bottom: 0 }}
          >
            <Text fw="700" size="xl">
              元智大學
            </Text>
            <Text>地址 : 320桃園市中壢區遠東路135號</Text>
            <Text>聯繫方式 : 034638800</Text>
            <Text>網站連結 : https://www.yzu.edu.tw/</Text>
            <Text>更新時間 : 2023-10-18</Text>
            <Flex c="blue" mt="md" justify="right">
              <Text
                style={{ textDecoration: 'underline', textDecorationThickness: rem(2) }}
                fw={600}
                size="md"
              >
                查看詳細內容
              </Text>
              <IconChevronRight />
            </Flex>
          </Card>,
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
