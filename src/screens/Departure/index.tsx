import React from "react";
import { Container, Content } from "./styles";
import { Header } from "../../components/Header";
import { LicensePlateInput } from "../../components/LicensePlateInput";

export function Departure() {
  return (
    <Container>
      <Header title="Saída" />
      <Content>
        <LicensePlateInput label="Placa do veiculo" placeholder="BRA1234" />
      </Content>
    </Container>
  );
}
