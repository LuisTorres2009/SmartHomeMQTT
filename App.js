import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Paho from 'paho-mqtt';
import StatusModal from './src/components/StatusModal';
import LightControl from './src/components/LightControl';
import Gauges from './src/components/Gauges';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [temp, setTemp] = useState(0);
  const [hum, setHum] = useState(0);

  useEffect(() => {
    const host = process.env.EXPO_PUBLIC_MQTT_HOST;
    const port = Number(process.env.EXPO_PUBLIC_MQTT_PORT) || 8884;
    const path = process.env.EXPO_PUBLIC_MQTT_PATH || '/mqtt';
    const clientId = 'RN_App_' + Math.random().toString(16).substr(2, 8);

    const client = new Paho.Client(host, port, path, clientId);

    client.onMessageArrived = (message) => {
      if (message.destinationName === 'casa/temp') setTemp(parseFloat(message.payloadString) || 0);
      if (message.destinationName === 'casa/umid') setHum(parseFloat(message.payloadString) || 0);
      if (message.destinationName === 'casa/luz') setIsLightOn(message.payloadString === "1");
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
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Smart Home IoT</Text>
      <Text style={{ color: isConnected ? '#2ECC71' : '#E74C3C', marginBottom: 20 }}>
        {isConnected ? '● Conectado' : '○ Desconectado'}
      </Text>
      <LightControl isLightOn={isLightOn} onToggle={() => {}} />
      <Gauges temp={temp} hum={hum} />
      <StatusModal visible={showError} onRetry={() => {}} onLater={() => setShowError(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, alignItems: 'center' },
  header: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 40 }
});