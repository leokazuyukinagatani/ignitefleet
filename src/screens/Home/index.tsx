import React from "react";
import { Container } from "./styles";
import { HomeHeader } from "../../components/HomeHeader";
import { useNavigation } from "@react-navigation/native";

export function Home() {
  const { navigate } = useNavigation()
  return (
    <Container>
      <HomeHeader />
    </Container>
  );
}
