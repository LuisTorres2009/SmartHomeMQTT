// src/services/storageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mqtt_history';

export const storageService = {
  // 1. Busca o histórico gravado no celular
  async loadHistory() {
    try {
      const savedHistory = await AsyncStorage.getItem(STORAGE_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.log("Erro ao carregar histórico local:", error);
      return [];
    }
  },

  // 2. Grava a lista atualizada de mensagens no celular
  async saveHistory(updatedHistory) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.log("Erro ao salvar histórico local:", error);
    }
  }
};