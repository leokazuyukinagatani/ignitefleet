import React from "react";
import { Container, Content } from "./styles";
import { HomeHeader } from "../../components/HomeHeader";
import { useNavigation } from "@react-navigation/native";
import { CarStatus } from "../../components/CarStatus";

export function Home() {
  const { navigate } = useNavigation();
  function handleRegisterMovement() {
    navigate("departure");
  }

  return (
    <Container>
      <HomeHeader />
      <Content>
        <CarStatus licensePlate="xxx-0000" onPress={handleRegisterMovement} />
      </Content>
    </Container>
  );
}
