import * as SecureStore from "expo-secure-store";
import { useCallback } from "react";

export const useSecureStorage = () => {
  const saveItem = useCallback(async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  }, []);

  const getItem = useCallback(async (key: string) => {
    return SecureStore.getItemAsync(key);
  }, []);

  const deleteItem = useCallback(async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  }, []);

  return { saveItem, getItem, deleteItem };
};

