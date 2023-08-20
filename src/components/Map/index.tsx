import { Container } from "./styles";
import MapView, {
  LatLng,
  MapViewProps,
  PROVIDER_GOOGLE,
} from "react-native-maps";

type Props = MapViewProps & {
  coordinates: LatLng[];
};
export function Map({ coordinates, ...rest }: Props) {
  const lastCoordinate = coordinates[coordinates.length - 1];

  return (
    <Container>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ width: "100%", height: 200 }}
        region={{
          latitude: lastCoordinate.latitude,
          longitude: lastCoordinate.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        {...rest}
      />
    </Container>
  );
}
