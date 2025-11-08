import * as SecureStore from "expo-secure-store";

const saveItem = async (key: string, value: string) => {
  await SecureStore.setItemAsync(key, value);
};

const getItem = async (key: string) => {
  return SecureStore.getItemAsync(key);
};

const deleteItem = async (key: string) => {
  await SecureStore.deleteItemAsync(key);
};

export const secureStorage = {
  saveItem,
  getItem,
  deleteItem
};

