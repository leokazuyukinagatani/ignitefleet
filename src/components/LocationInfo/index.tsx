import { Description } from "../../screens/Arrival/styles";
import { Title } from "../Button/styles";
import { Container, Info, Label } from "./styles";

export type LocationInfoProps = {
  label: string;
  description: string;
};

type Props = LocationInfoProps;
export function LocationInfo({ label, description }: Props) {
  return (
    <Container>
      <Info>
        <Label numberOfLines={1}>{label}</Label>
        <Description numberOfLines={1}>{description}</Description>
      </Info>
    </Container>
  );
}
