import { useViewportSize } from '@mantine/hooks';
import { useEffect } from 'react';
import {
  MapContainer,
  MapContainerProps,
  Marker,
  Popup,
  TileLayer,
  TileLayerProps,
  useMap,
} from 'react-leaflet';
import { Icon, Control } from 'leaflet';
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
      }
    `,
      }}
    />
  );
}

export default function MapPage() {
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
      <LeafletContainerStyle />
      <MapContainer {...mapProps}>
        <Resizer />
        <TileLayer {...tileLayerProps} />
        {places.map(({ ID, Name, Latitude, Longitude }) => (
          <Marker key={ID} position={{ lat: Latitude, lng: Longitude }}>
            <Popup>{Name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}
