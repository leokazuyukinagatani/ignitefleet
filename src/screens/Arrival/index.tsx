import React from "react";
import {
  Container,
  Content,
  Description,
  Footer,
  Label,
  LicensePlate,
} from "./styles";
import { useRoute } from "@react-navigation/native";
import { Header } from "../../components/Header";
import { Button } from "../../components/Button";
import { ButtonIcon } from "../../components/ButtonIcon";

import { X } from "phosphor-react-native";

import { BSON } from "realm";
import { useObject, useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/Historic";
import { Alert } from "react-native";

type RouteParamsProps = {
  id: string;
};
export function Arrival() {
  const route = useRoute();
  const { id } = route.params as RouteParamsProps;
  const realm = useRealm()

  const historic = useObject<Historic>(
    Historic,
    new BSON.UUID(id) as unknown as string
  );

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
      })

    } catch (error) {
      
    }
  }

  return (
    <Container>
      <Header title="Chegada"></Header>
      <Content>
        <Label>Placa do veículo</Label>
        <LicensePlate>{historic?.license_plate}</LicensePlate>
        <Label>Finalidade</Label>
        <Description>{historic?.description}</Description>
        <Footer>
          <ButtonIcon icon={X} onPress={handleRemoveVehicleUsage} />
          <Button title="Registrar chegada" />
        </Footer>
      </Content>
    </Container>
  );
}
