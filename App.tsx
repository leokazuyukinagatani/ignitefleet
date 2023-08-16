import { ThemeProvider } from "styled-components";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";
import { SignIn } from "./src/screens/SignIn";
import theme from "./src/theme";
import { Loading } from "./src/components/Loading";
import { StatusBar } from "react-native";

import { REALM_APP_ID } from "@env";
import { AppProvider, UserProvider } from "@realm/react";
import { Home } from "./src/screens/Home";

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });
  if (!fontsLoaded) {
    return <Loading />;
  }
  return (
    <AppProvider id={REALM_APP_ID}>
      <ThemeProvider theme={theme}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <UserProvider fallback={SignIn}>
          <Home />
        </UserProvider>
      </ThemeProvider>
    </AppProvider>
  );
}
