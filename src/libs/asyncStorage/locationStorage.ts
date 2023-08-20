import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@ignitefleet:location";

type LocationProps = {
  latitude: number;
  longitude: number;
  timestamp: number;
};

export async function getStorageLocations() {
  try {
    const storage = await AsyncStorage.getItem(STORAGE_KEY);
    const response = storage ? JSON.parse(storage) : [];

    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function saveStorageLocations(location: LocationProps) {
  try {
    const storage = await getStorageLocations();
    storage.push(location);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function removeStorageLocations() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
