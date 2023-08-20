import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Alert, ScrollView, TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  LocationAccuracy,
  LocationObjectCoords,
  LocationSubscription,
  requestBackgroundPermissionsAsync,
  useForegroundPermissions,
  watchPositionAsync,
} from "expo-location";

import { useUser } from "@realm/react";
import { useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/Historic";
import { startLocationTask } from "../../tasks/backgroundLocationTask";

import { Container, Content, Message } from "./styles";
import { Button } from "../../components/Button";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import { LocationInfo } from "../../components/LocationInfo";
import { TextAreaInput } from "../../components/TextAreaInput";
import { LicensePlateInput } from "../../components/LicensePlateInput";

import { AppError } from "../../utils/AppError";
import { getAddressLocation } from "../../utils/getAddressLocation";
import { licensePlateValidate } from "../../utils/licensePlateValidate";
import { Car } from "phosphor-react-native";
import { Map } from "../../components/Map";

type Props = {
  userId: string;
  description: string;
  licensePlate: string;
};
export function Departure() {
  const [description, setDescription] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] =
    useState<LocationObjectCoords | null>(null);

  const [locationForegroundPermission, requestLocationForegroundPermission] =
    useForegroundPermissions();
  const realm = useRealm();
  const user = useUser();
  const { goBack } = useNavigation();
  const descriptionRef = useRef<TextInput>(null);
  const licensePlateRef = useRef<TextInput>(null);

  async function handleDepartureRegister({
    userId,
    description,
    licensePlate,
  }: Props) {
    try {
      validateLicense(licensePlate);
      validateDescription(description);
      validateCoords(currentCoords);

      setIsRegistering(true);

      await requestBackgroundCoords();

      await startLocationTask()

      createHistoric({ userId, description, licensePlate });
      Alert.alert("Saida", "Saida registrada com sucesso!");
      goBack();
    } catch (error) {
      console.log(error);
      if (error instanceof AppError) {
        Alert.alert(error.title, error.message);
        return;
      } else {
        Alert.alert(
          "Erro ao registrar saída",
          "Ocorreu um erro ao registrar a saída. Por favor, tente novamente."
        );
      }
    } finally {
      setIsRegistering(false);
    }
  }

  function createHistoric({ userId, description, licensePlate }: Props) {
    try {
      realm.write(() => {
        realm.create(
          "Historic",
          Historic.generate({
            user_id: userId,
            description,
            license_plate: licensePlate.toUpperCase(),
          })
        );
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  function validateLicense(licensePlate: string) {
    if (!licensePlateValidate(licensePlate)) {
      licensePlateRef.current?.focus();
      throw new AppError(
        "Placa inválida",
        "A placa é inválida. Por favor informe a placa correta do veículo."
      );
    }
  }
  function validateDescription(description: string) {
    if (description.trim().length === 0) {
      descriptionRef.current?.focus();
      throw new AppError(
        "Finalidade inválida",
        "Campo finalidade é obrigatário. Por favor, informe a finalidade da utilização do veículo"
      );
    }
  }
  function validateCoords(coords: LocationObjectCoords | null) {
    if (!coords) {
      throw new AppError(
        "Localização inválida",
        "O aplicativo não conseguiu localizar sua localização. Por favor, tente novamente."
      );
    }
  }

  async function requestBackgroundCoords() {
    const backgroundPermissions = await requestBackgroundPermissionsAsync();
    if (!backgroundPermissions.granted) {
      throw new AppError(
        "Localização",
        "É necessário permitir que o App tenha acesso a localização em segundo plano para continuar. Acesse as configurações do dispositivo e habilite 'Permitir o tempo todo'"
      );
    }
  }
  

  useEffect(() => {
    requestLocationForegroundPermission();
  }, []);

  useEffect(() => {
    if (!locationForegroundPermission?.granted) {
      return;
    }

    let subscription: LocationSubscription;
    watchPositionAsync(
      {
        accuracy: LocationAccuracy.High,
        timeInterval: 5000,
      },
      (location) => {
        setCurrentCoords(location.coords);
        getAddressLocation(location.coords)
          .then((address) => {
            if (address) {
              setCurrentAddress(address);
            }
          })
          .finally(() => setIsLoadingLocation(false));
      }
    ).then((response) => (subscription = response));

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [locationForegroundPermission]);

  if (isLoadingLocation) {
    return <Loading />;
  }

  if (!locationForegroundPermission?.granted) {
    return (
      <Container>
        <Header title="Saída" />
        <Message>
          Você precisa permitir que o aplicativo tenha acesso a localização para
          utilizar essa funcionalidade. Por favor, acesse as configurações do
          seu dispositivo para conceder essa permissão ao aplicativo.
        </Message>
      </Container>
    );
  }
  return (
    <Container>
      <Header title="Saída" />
      <KeyboardAwareScrollView extraHeight={100}>
        <ScrollView>
          {currentCoords && <Map coordinates={[currentCoords]} />}
          <Content>
            {currentAddress && (
              <LocationInfo
                icon={Car}
                label="Localização atual"
                description={currentAddress}
              />
            )}
            <LicensePlateInput
              ref={licensePlateRef}
              label="Placa do veiculo"
              placeholder="BRA1234"
              onSubmitEditing={() => descriptionRef.current?.focus()}
              returnKeyType="next"
              onChangeText={setLicensePlate}
            />
            <TextAreaInput
              ref={descriptionRef}
              label="Finalidade"
              placeholder="Vou utilizar o veículo para..."
              onSubmitEditing={() =>
                handleDepartureRegister({
                  userId: user.id,
                  description,
                  licensePlate,
                })
              }
              returnKeyType="send"
              onChangeText={setDescription}
              blurOnSubmit
            />
            <Button
              title="Registrar Saída"
              onPress={() =>
                handleDepartureRegister({
                  userId: user.id,
                  description,
                  licensePlate,
                })
              }
              isLoading={isRegistering}
            />
          </Content>
        </ScrollView>
      </KeyboardAwareScrollView>
    </Container>
  );
}
