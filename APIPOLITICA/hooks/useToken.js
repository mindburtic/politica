import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useClient = () => {
  const [idUser, setIdUser] = useState(null);

  const getClient = async () => {
    try {
      const id = await AsyncStorage.getItem("accessToken");
      setIdUser(id);
    } catch (error) {
      console.log(error, "other err");
    }
  };

  useEffect(() => {
    getClient();
  }, []);

  return { idUser };
};