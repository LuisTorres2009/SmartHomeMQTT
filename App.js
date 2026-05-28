import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, ScrollView, TouchableOpacity } from 'react-native'; 
import Paho from 'paho-mqtt';
import { storageService } from './src/services/storageService'; 
import StatusModal from './src/components/StatusModal';
import LightControl from './src/components/LightControl';
import Gauges from './src/components/Gauges';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [temp, setTemp] = useState(0);
  const [hum, setHum] = useState(0);
  const [history, setHistory] = useState([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false); 

  useEffect(() => {
    const initStorage = async () => {
      const data = await storageService.loadHistory();
      setHistory(data);
    };
    initStorage();
  }, []);

  const handleNewLog = useCallback((topic, sensorType, value) => {
    const newLog = {
      id: Date.now().toString(),
      topic: topic,      
      sensor: sensorType,
      value: value,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setHistory(prevHistory => {
      const updated = [newLog, ...prevHistory].slice(0, 20); 
      storageService.saveHistory(updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    const host = process.env.EXPO_PUBLIC_MQTT_HOST;
    const port = Number(process.env.EXPO_PUBLIC_MQTT_PORT) || 8884;
    const path = process.env.EXPO_PUBLIC_MQTT_PATH || '/mqtt';
    const clientId = 'RN_App_' + Math.random().toString(16).substr(2, 8);

    const client = new Paho.Client(host, port, path, clientId);

    client.onMessageArrived = (message) => {
      const topic = message.destinationName; 
      const valueParsed = parseFloat(message.payloadString) || 0;

      if (topic === 'casa/temp') {
        setTemp(valueParsed);
        handleNewLog(topic, 'Temperatura', `${valueParsed}°C`);
      }
      if (topic === 'casa/umid') {
        setHum(valueParsed);
        handleNewLog(topic, 'Umidade', `${valueParsed}%`);
      }
      if (topic === 'casa/luz') {
        const lightState = message.payloadString === "1";
        setIsLightOn(lightState);
        handleNewLog(topic, 'Luz', lightState ? "Ligada" : "Desligada");
      }
    };

    client.connect({
      userName: process.env.EXPO_PUBLIC_MQTT_USER,
      password: process.env.EXPO_PUBLIC_MQTT_PASS,
      useSSL: true,
      onSuccess: () => {
        setIsConnected(true);
        client.subscribe('casa/temp');
        client.subscribe('casa/umid');
        client.subscribe('casa/luz');
      },
      onFailure: (err) => {
        console.log("Erro:", err);
        setIsConnected(false);
        setShowError(true);
      }
    });

    return () => {
      if (client.isConnected()) client.disconnect();
    };
  }, [handleNewLog]); 

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer} 
      style={[styles.mainBackground, styles.hideGlobalScrollbar]} 
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Smart Home IoT</Text>
      <Text style={{ color: isConnected ? '#2ECC71' : '#E74C3C', marginBottom: 20 }}>
        {isConnected ? '● Conectado ao Broker' : '○ Desconectado'}
      </Text>
      
      <LightControl isLightOn={isLightOn} onToggle={() => {}} />
      <Gauges temp={temp} hum={hum} />

      <View style={styles.historyWrapper}>

        <View style={styles.historyHeader}>
          <TouchableOpacity 
            style={styles.arrowButton} 
            onPress={() => setIsHistoryVisible(!isHistoryVisible)}
            activeOpacity={0.7}
          >
            {/* Triângulo via View — sem fonte, sem Unicode, sem distorção */}
            <View style={isHistoryVisible ? styles.arrowDown : styles.arrowRight} />
          </TouchableOpacity>
          <Text style={styles.historyTitle}>Histórico de Leituras Local</Text>
        </View>

        {isHistoryVisible && (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            style={[styles.customScrollbar, styles.historyList]}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <View>
                  <Text style={styles.topicText}>{item.topic}</Text> 
                  <Text style={styles.historyText}>{item.time} - {item.sensor}</Text>
                </View>
                <Text style={styles.historyValue}>{item.value}</Text>
              </View>
            )}
          />
        )}
      </View>

      <StatusModal visible={showError} onRetry={() => {}} onLater={() => setShowError(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainBackground: { backgroundColor: '#121212' },
  scrollContainer: { padding: 20, alignItems: 'center', minHeight: '100%' },
  header: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 30 },

  historyWrapper: {
    width: '100%',
    marginTop: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 15,
  },

  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  arrowButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Triângulo apontando pra direita (fechado)
  arrowRight: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 13,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#3498DB',
  },

  // Triângulo apontando pra baixo (aberto)
  arrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 13,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#3498DB',
  },

  historyTitle: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 32,
  },

  historyList: {
    height: 270,
    marginTop: 12,
  },

  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#333' },
  topicText: { color: '#3498DB', fontSize: 15, fontWeight: 'bold', textTransform: 'lowercase' }, 
  historyText: { color: '#AAA', fontSize: 13, marginTop: 2 },
  historyValue: { color: '#2ECC71', fontSize: 14, fontWeight: 'bold', marginRight: 20 },

  hideGlobalScrollbar: {
    scrollbarWidth: 'none', 
    msOverflowStyle: 'none',  
    ...{ '::-webkit-scrollbar': { display: 'none' } }
  },

  customScrollbar: {
    scrollbarWidth: 'thin', 
    scrollbarColor: '#3498DB #252525',
    ...{
      '::-webkit-scrollbar': { width: '22px' },
      '::-webkit-scrollbar-track': { backgroundColor: '#252525', borderRadius: '10px' },
      '::-webkit-scrollbar-thumb': { backgroundColor: '#3498DB', borderRadius: '10px', border: '3px solid #252525' },
      '::-webkit-scrollbar-button:single-button': {
        backgroundColor: '#252525',
        display: 'block',
        backgroundSize: '10px',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        height: '14px',
      },
      '::-webkit-scrollbar-button:single-button:start:decrement': {
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%233498DB'><polygon points='50,0 0,100 100,100'/></svg>")`,
      },
      '::-webkit-scrollbar-button:single-button:end:increment': {
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%233498DB'><polygon points='50,100 0,0 100,0'/></svg>")`,
      }
    }
  }
});