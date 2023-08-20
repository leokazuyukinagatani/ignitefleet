import React, { useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Alert, Platform, ScrollView, TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { Container, Content } from "./styles";
import { Header } from "../../components/Header";
import { LicensePlateInput } from "../../components/LicensePlateInput";
import { TextAreaInput } from "../../components/TextAreaInput";
import { Button } from "../../components/Button";
import { licensePlateValidade } from "../../utils/licensePlateValidate";
import { useUser } from "@realm/react";
import { useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/Historic";
import { AppError } from "../../utils/AppError";

type Props = {
  userId: string;
  description: string;
  licensePlate: string;
};
export function Departure() {
  const [description, setDescription] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

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

      setIsRegistering(true);
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
    if (!licensePlateValidade(licensePlate)) {
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

  return (
    <Container>
      <Header title="Saída" />
      <KeyboardAwareScrollView extraHeight={100}>
        <ScrollView>
          <Content>
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
