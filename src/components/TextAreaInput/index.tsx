import React from "react";
import { Container, Input, Label } from "./styles";
import { TextInputProps } from "react-native";
import { useTheme } from "styled-components";

type Props = TextInputProps & {
  label: string;
};
export function TextAreaInput({ label, ...rest }: Props) {
  const { COLORS } = useTheme();
  return (
    <Container>
      <Label>{label}</Label>
      <Input
        placeholderTextColor={COLORS.GRAY_300}
        multiline
        autoCapitalize="sentences"
        {...rest}
      />
    </Container>
  );
}
