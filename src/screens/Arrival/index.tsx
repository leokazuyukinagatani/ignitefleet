import { useEffect, useState } from "react";
import {
  AsyncMessage,
  Container,
  Content,
  Description,
  Footer,
  Label,
  LicensePlate,
} from "./styles";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Header } from "../../components/Header";
import { Button } from "../../components/Button";
import { ButtonIcon } from "../../components/ButtonIcon";

import { X } from "phosphor-react-native";

import { BSON } from "realm";
import { useObject, useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/Historic";
import { Alert } from "react-native";
import { getLastAsyncTimestamp } from "../../libs/asyncStorage/syncStorage";
import { AppError } from "../../utils/AppError";
import { stopLocationTask } from "../../tasks/backgroundLocationTask";

type RouteParamsProps = {
  id: string;
};
export function Arrival() {
  const [dataNotSynced, setDataNotSynced] = useState(false);
  const route = useRoute();
  const { id } = route.params as RouteParamsProps;
  const { goBack } = useNavigation();
  const realm = useRealm();

  const historic = useObject<Historic>(
    Historic,
    new BSON.UUID(id) as unknown as string
  );

  const title = historic?.status === "departure" ? "Chegada" : "Detalhes";

  function handleRemoveVehicleUsage() {
    Alert.alert("Cancelar", "Cancelar a utilização do veículo?", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim",
        onPress: () => {
          removeVehicleUsage();
        },
      },
    ]);
  }

  function removeVehicleUsage() {
    try {
      realm.write(() => {
        realm.delete(historic);
      });
      goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível cancelar a utilização do veículo");
    }
  }

  async function handleArrivalRegister() {
    try {
      validateHistoric(historic);
      realm.write(() => {
        historic!.status = "arrival";
        historic!.updated_at = new Date();
      });

      await stopLocationTask();
      Alert.alert("Chegada registrada", "Veículo chegou ao local.");
      goBack();
    } catch (error) {
      console.log(error);
      if (error instanceof AppError) {
        Alert.alert("Erro", error.message);
        return;
      } else {
        Alert.alert("Erro", "Não foi possível registrar a chegada do veículo");
      }
    }
  }

  function validateHistoric(historic: Historic | null) {
    if (historic == null) {
      throw new AppError(
        "Erro",
        "Não foi possível obter os dados para registrar a chegada do veículo."
      );
    }
  }
  useEffect(() => {
    getLastAsyncTimestamp().then((timestamp) => {
      setDataNotSynced(historic!.updated_at.getTime() > timestamp);
    });
  }, []);
  return (
    <Container>
      <Header title={title}></Header>
      <Content>
        <Label>Placa do veículo</Label>
        <LicensePlate>{historic?.license_plate}</LicensePlate>
        <Label>Finalidade</Label>
        <Description>{historic?.description}</Description>
      </Content>
      {historic?.status === "departure" && (
        <Footer>
          <ButtonIcon icon={X} onPress={handleRemoveVehicleUsage} />
          <Button title="Registrar chegada" onPress={handleArrivalRegister} />
        </Footer>
      )}
      {dataNotSynced && (
        <AsyncMessage>
          Sincronização da{" "}
          {historic?.status === "departure" ? "partida" : "chegada"} pendente.
        </AsyncMessage>
      )}
    </Container>
  );
}
