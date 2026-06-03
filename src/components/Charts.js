import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';

export default function Charts({ history }) {
  // Filtra e traz os registros armazenados no histórico (em ordem cronológica)
  const tempLogs = history.filter(item => item.topic === 'casa/temp').reverse();
  const umidLogs = history.filter(item => item.topic === 'casa/umid').reverse();
  const luzLogs = history.filter(item => item.topic === 'casa/luz').reverse();

  // Função simples para extrair o número de strings como "45%" ou "23°C"
  const parseValue = (valStr) => {
    return parseFloat(valStr.replace(/[^\d.-]/g, '')) || 0;
  };

  // --- CONFIGURAÇÃO DA TEMPERATURA (-100°C a +100°C) ---
  // Retorna a porcentagem que a barra deve preencher da SUA METADE (0 a 100% da metade)
  const calculateTempHeightPct = (val) => {
    const absValue = Math.abs(val);
    const clampedValue = Math.min(absValue, 100); 
    return `${clampedValue}%`;
  };

  // Função para colorir as colunas de temperatura baseada no valor real
  const getTempColor = (val) => {
    if (val <= 0) return '#5DADE2';  // Azul Glacial (Frio / Negativos)
    if (val < 22) return '#2ECC71';  // Verde Conforto
    if (val < 32) return '#E67E22';  // Laranja Quente
    return '#E74C3C';                 // Vermelho Neon
  };

  // --- CONFIGURAÇÃO DA UMIDADE (0% a 100%) ---
  // Como o dado já vem travado entre 0 e 100 pelo App.js, o valor é a própria porcentagem da altura
  const calculateHumidityHeightPct = (val) => {
    return `${val}%`;
  };

  return (
    <View style={styles.insideContainer}>
      
      {/* --- GRÁFICO DE TEMPERATURA (ESCALA: -100°C a 100°C) --- */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeaderRow}>
          <Text style={styles.chartTitle}>Temperatura Geral</Text>
          <Text style={styles.chartSubtitle}>Escala Fixa: -100°C a 100°C</Text>
        </View>

        <View style={styles.chartMainLayout}>
          {/* Marcadores de Eixo Fixos na Esquerda */}
          <View style={styles.leftAxisOverlay}>
            <Text style={styles.axisLabel}>100°C</Text>
            <Text style={[styles.axisLabel, styles.zeroAxisLabel]}>0°C</Text>
            <Text style={styles.axisLabel}>-100°C</Text>
          </View>

          <View style={styles.chartBodyContainer}>
            {/* Linhas de Grade Horizontais de Fundo */}
            <View style={styles.gridOverlay}>
              <View style={styles.gridLine} />
              <View style={[styles.gridLine, styles.zeroGridLine]} />
              <View style={styles.gridLine} />
            </View>

            {/* Scroll Horizontal de Colunas */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.barsScrollView}>
              <View style={styles.barChartRow}>
                {tempLogs.length === 0 ? (
                  <Text style={styles.noDataText}>Aguardando dados...</Text>
                ) : (
                  tempLogs.map((item) => {
                    const val = parseValue(item.value);
                    const fillHeight = calculateTempHeightPct(val);
                    const dynamicColor = getTempColor(val);
                    const isPositive = val >= 0;

                    return (
                      <View key={item.id} style={styles.columnTrackWrapper}>
                        <Text style={[styles.barValueText, { color: dynamicColor }]} numberOfLines={1}>
                          {val.toFixed(0)}°
                        </Text>
                        
                        <View style={styles.columnTrack}>
                          {/* Bloco da Metade Superior (Positivos) */}
                          <View style={styles.upperHalfContainer}>
                            {isPositive && (
                              <View style={[styles.barFill, { height: fillHeight, backgroundColor: dynamicColor, borderTopLeftRadius: 6, borderTopRightRadius: 6 }]} />
                            )}
                          </View>

                          {/* Bloco da Metade Inferior (Negativos) */}
                          <View style={styles.lowerHalfContainer}>
                            {!isPositive && (
                              <View style={[styles.barFill, { height: fillHeight, backgroundColor: dynamicColor, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }]} />
                            )}
                          </View>
                        </View>
                        
                        <Text style={styles.timeLabel}>{item.time.substring(0, 5)}</Text>
                      </View>
                    );
                  })
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      {/* --- GRÁFICO DE UMIDADE PURIFICADO (ESCALA VERDADEIRA: 0% a 100%) --- */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeaderRow}>
          <Text style={styles.chartTitle}>Umidade Geral</Text>
          <Text style={styles.chartSubtitle}>Escala Fixa: 0% a 100%</Text>
        </View>

        <View style={styles.chartMainLayout}>
          {/* Marcadores de Eixo Modificados (Sem números negativos) */}
          <View style={styles.leftAxisOverlay}>
            <Text style={styles.axisLabel}>100%</Text>
            <Text style={[styles.axisLabel, styles.zeroAxisLabel]}>50%</Text>
            <Text style={styles.axisLabel}>0%</Text>
          </View>

          <View style={styles.chartBodyContainer}>
            {/* Grid de Fundo Linear para Escala de 0 a 100 */}
            <View style={styles.gridOverlay}>
              <View style={styles.gridLine} />
              <View style={[styles.gridLine, styles.humidityMidGridLine]} />
              <View style={styles.gridLine} />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.barsScrollView}>
              <View style={styles.barChartRow}>
                {umidLogs.length === 0 ? (
                  <Text style={styles.noDataText}>Aguardando dados...</Text>
                ) : (
                  umidLogs.map((item) => {
                    const val = parseValue(item.value);
                    const fillHeight = calculateHumidityHeightPct(val);

                    return (
                      <View key={item.id} style={styles.columnTrackWrapper}>
                        <Text style={[styles.barValueText, { color: '#3498DB' }]} numberOfLines={1}>
                          {val.toFixed(0)}%
                        </Text>
                        
                        {/* Canaleta de Umidade: Alinha na base (flex-end) para crescer linearmente de 0 a 100% */}
                        <View style={[styles.columnTrack, { justifyContent: 'flex-end' }]}>
                          <View 
                            style={[
                              styles.barFill, 
                              { 
                                height: fillHeight, 
                                backgroundColor: '#3498DB', 
                                borderTopLeftRadius: 6, 
                                borderTopRightRadius: 6,
                                borderRadius: val >= 100 ? 8 : undefined // Arredonda tudo se atingir 100% cheio
                              }
                            ]} 
                          />
                        </View>
                        
                        <Text style={styles.timeLabel}>{item.time.substring(0, 5)}</Text>
                      </View>
                    );
                  })
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      {/* --- LINHA DO TEMPO DA LUZ --- */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Atividades Recentes de Iluminação</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          <View style={styles.timelineRow}>
            {luzLogs.length === 0 ? (
              <Text style={styles.noDataText}>Sem atividades...</Text>
            ) : (
              luzLogs.map((item) => {
                const isOn = item.value === 'Ligada';
                return (
                  <View key={item.id} style={styles.timelineBlockWrapper}>
                    <View style={[styles.timelineBlock, isOn ? styles.blockOn : styles.blockOff]}>
                      <Text style={[styles.blockText, { color: isOn ? '#121212' : '#777' }]}>{isOn ? 'ON' : 'OFF'}</Text>
                    </View>
                    <Text style={styles.timeLabel}>{item.time.substring(0, 5)}</Text>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  insideContainer: { width: '100%', marginTop: 10 },
  chartCard: { backgroundColor: '#121212', padding: 16, borderRadius: 18, marginBottom: 15, width: '100%' },
  
  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chartTitle: { color: '#FFF', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  chartSubtitle: { color: '#555', fontSize: 10, fontWeight: '600' },

  chartMainLayout: { flexDirection: 'row', width: '100%', height: 210 },

  // Eixo esquerdo fixo alinhado perfeitamente com a altura das barras (140px)
  leftAxisOverlay: { width: 45, height: 140, justifyContent: 'space-between', marginTop: 20, paddingRight: 8 },
  axisLabel: { color: '#555', fontSize: 9, fontWeight: 'bold', textAlign: 'right' },
  zeroAxisLabel: { color: '#888' },

  chartBodyContainer: { flex: 1, height: '100%', justifyContent: 'flex-start', position: 'relative' },
  
  // Grid matemático de fundo
  gridOverlay: { position: 'absolute', top: 20, left: 0, right: 0, height: 140, justifyContent: 'space-between', zIndex: 0 },
  gridLine: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  zeroGridLine: { backgroundColor: 'rgba(255,255,255,0.25)', height: 1 },
  humidityMidGridLine: { backgroundColor: 'rgba(255,255,255,0.05)', height: 1 }, // Linha tênue para indicar 50%

  barsScrollView: { flex: 1, zIndex: 1 },
  barChartRow: { flexDirection: 'row', height: '100%', position: 'relative', paddingLeft: 4 },
  
  columnTrackWrapper: { width: 50, alignItems: 'center', marginHorizontal: 3, height: '100%' },
  barValueText: { fontSize: 9, fontWeight: '800', height: 16, marginBottom: 4, textAlign: 'center', width: '100%' },
  timeLabel: { color: '#555', fontSize: 9, fontWeight: '600', marginTop: 6 },

  // Canaleta escura de fundo
  columnTrack: { height: 140, width: 22, backgroundColor: '#1A252F', borderRadius: 8, overflow: 'hidden' },
  
  // Divisores estritos para o gráfico bidirecional (Temperatura)
  upperHalfContainer: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  lowerHalfContainer: { flex: 1, width: '100%', justifyContent: 'flex-start' },
  
  barFill: { width: '100%' },

  timelineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  timelineBlockWrapper: { alignItems: 'center', marginHorizontal: 5 },
  timelineBlock: { width: 34, height: 34, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  blockOn: { backgroundColor: '#F1C40F', borderColor: '#F39C12' },
  blockOff: { backgroundColor: '#1E1E1E', borderColor: '#2D2D2D' },
  blockText: { fontSize: 9, fontWeight: '800' },
  
  noDataText: { color: '#444', fontSize: 12, textAlign: 'center', width: '100%', marginTop: 60, fontWeight: '600' }
});