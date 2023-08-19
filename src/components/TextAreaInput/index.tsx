import React, { forwardRef } from "react";
import { Container, Input, Label } from "./styles";
import { TextInput, TextInputProps } from "react-native";
import { useTheme } from "styled-components";

type Props = TextInputProps & {
  label: string;
};
const TextAreaInput = forwardRef<TextInput, Props>(
  ({ label, ...rest }, ref) => {
    const { COLORS } = useTheme();
    return (
      <Container>
        <Label>{label}</Label>
        <Input
          ref={ref}
          placeholderTextColor={COLORS.GRAY_300}
          multiline
          autoCapitalize="sentences"
          {...rest}
        />
      </Container>
    );
  }
);

export { TextAreaInput };
