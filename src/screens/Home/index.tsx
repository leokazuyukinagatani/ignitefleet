import { Alert, FlatList } from "react-native";
import React, { useEffect, useState } from "react";

import { useQuery, useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/Historic";
import { Toast } from "react-native-toast-message/lib/src/Toast";

import { HomeHeader } from "../../components/HomeHeader";
import { useNavigation } from "@react-navigation/native";
import { CarStatus } from "../../components/CarStatus";
import { CloudArrowDown } from "phosphor-react-native";
import { TopMessage } from "../../components/TopMessage";
import { HistoricCard, HistoricCardProps } from "../../components/HistoricCard";
import { Container, Content, Label, Title } from "./styles";

import dayjs from "dayjs";
import { useUser } from "@realm/react";
import {
  getLastAsyncTimestamp,
  saveLastSyncTimestamp,
} from "../../libs/asyncStorage/syncStorage";

export function Home() {
  const [vehicleInUse, setVehicleInUse] = useState<Historic | null>(null);
  const [vehicleHistoric, setVehicleHistoric] = useState<HistoricCardProps[]>(
    []
  );

  const [percentageToSync, setPercentageToSync] = useState<string | null>(null);
  const { navigate } = useNavigation();
  const user = useUser();
  const realm = useRealm();

  const historic = useQuery(Historic);

  function handleRegisterMovement() {
    if (vehicleInUse?._id) {
      return navigate("arrival", { id: vehicleInUse?._id.toString() });
    } else {
      navigate("departure");
    }
  }

  function handleHistoricDetails(id: string) {
    navigate("arrival", { id });
  }

  function fetchVehicleInUse() {
    try {
      const vehicle = historic.filtered("status = 'departure'")[0];
      setVehicleInUse(vehicle);
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Veículo em uso",
        "Não foi possível carregar o veículo em uso."
      );
    }
  }

  async function fetchHistoric() {
    try {
      const response = historic.filtered(
        "status = 'arrival' SORT(created_at DESC)"
      );

      const lastSync = await getLastAsyncTimestamp();

      const formattedHistoric = response.map((historic) => {
        return {
          id: historic._id.toString(),
          licensePlate: historic.license_plate,
          isSync: lastSync > historic.updated_at!.getTime(),
          created: dayjs(historic.created_at).format(
            "[Saída em] DD/MM/YYYY [às] HH:mm"
          ),
        };
      });

      setVehicleHistoric(formattedHistoric);
    } catch (error) {
      console.log(error);
      Alert.alert("Histórico", "Não foi possível carregar o histórico.");
    }
  }

  async function progressNotification(
    transferred: number,
    transferable: number
  ) {
    const percentage = (transferred / transferable) * 100;
    if (percentage === 100) {
      await saveLastSyncTimestamp();
      await fetchHistoric();
      setPercentageToSync(null);

      Toast.show({
        type: "info",
        text1: "Sincronização concluída",
      });
    }
    if (percentage < 100) {
      setPercentageToSync(`${percentage.toFixed(2)}% sincronizado`);
    }
  }


  useEffect(() => {
    fetchVehicleInUse();
  }, []);

  useEffect(() => {
    fetchHistoric();
  }, [historic]);

  useEffect(() => {
    realm.addListener("change", () => fetchVehicleInUse());

    return () => {
      if (realm && !realm.isClosed) {
        realm.removeListener("change", fetchVehicleInUse);
      }
    };
  }, []);

  useEffect(() => {
    realm.subscriptions.update((mutableSubs, realm) => {
      const historicByUserQuery = realm
        .objects("Historic")
        .filtered(`user_id= '${user!.id}'`);
      mutableSubs.add(historicByUserQuery, { name: "historic_by_user" });
    });
  }, [realm]);

  useEffect(() => {
    const syncSession = realm.syncSession;

    if (!syncSession) {
      return;
    }
    syncSession.addProgressNotification(
      Realm.ProgressDirection.Upload,
      Realm.ProgressMode.ReportIndefinitely,
      progressNotification
    );

    return () => syncSession.removeProgressNotification(progressNotification);
  }, []);

  return (
    <Container>
      {percentageToSync && (
        <TopMessage title={percentageToSync} icon={CloudArrowDown} />
      )}
      <HomeHeader />
      <Content>
        <CarStatus
          licensePlate={vehicleInUse?.license_plate}
          onPress={handleRegisterMovement}
        />
        <Title>Historico</Title>
        <FlatList
          data={vehicleHistoric}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoricCard
              data={item}
              onPress={() => handleHistoricDetails(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={() => (
            <Label>Nenhum registro de utilização</Label>
          )}
        />
      </Content>
    </Container>
  );
}
