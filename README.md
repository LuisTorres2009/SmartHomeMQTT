# 🏠📱 Smart Home IoT App

Este é um aplicativo mobile desenvolvido com React Native e Expo (SDK 54) para o monitoramento e controle residencial em tempo real através do protocolo MQTT. 
O projeto foi estruturado utilizando boas práticas de arquitetura limpa, separando a camada visual da lógica de persistência de dados.

Link do primeiro vídeo: https://drive.google.com/file/d/19x03KP4ZSpHAuG27ot8Mz5-OOgKm1krT/view?usp=sharing
Link do segundo vídeo: https://drive.google.com/file/d/1k1SZZ4HnprLBFPViMiI1JEsQsrx2JZKL/view?usp=sharing

## 🚀 Funcionalidades Implementadas

1. Monitoramento em Tempo Real: Consome tópicos de sensores de temperatura (casa/temp) e umidade (casa/umid).
2. Controle de Atuadores: Exibe e interage com o estado de lâmpadas através do tópico (casa/luz).
3. Desafio de Persistência Local (AsyncStorage): Implementação de um histórico local que grava as últimas 20 leituras diretamente no dispositivo (armazenamento seguro do cliente). Os dados NÃO são perdidos ao fechar ou reiniciar o aplicativo!
4. Interface Customizada: Histórico com destaque para o caminho do tópico em azul (topic) e barra de rolagem interna (scrollbar) totalmente estilizada com tamanho, arredondamento e cor personalizada para a plataforma Web.
5. Sanitização e Trava de Segurança na Entrada (Data Clamping): Implementação de filtros matemáticos rigorosos diretamente no recebimento das mensagens MQTT (`Math.max` e `Math.min`). Isso impede que surtos ou leituras erráticas dos sensores quebrem a interface, forçando a umidade a se manter estritamente entre 0% e 100%, e a temperatura no limite operacional de -100°C a 100°C.
6. Gráficos Analíticos de Escala Fixa e Linear: Desenvolvimento de um dashboard visual onde o gráfico de umidade foi purificado para exibir apenas valores de 0 a 100 (eliminando escalas negativas inconsistentes na física do ar). A barra de umidade cresce de forma perfeitamente linear a partir da base (0%) até o topo (100%), alinhando-se aos marcadores estáticos do eixo lateral.
7. Sincronização e Consistência de Dados: Devido ao tratamento centralizado efetuado diretamente no payload do `App.js`, os componentes visuais de Gráficos (`Charts`), os Medidores Circulares (`Gauges`) e a lista textual do Histórico Local operam com dados 100% idênticos e calibrados, eliminando discrepâncias de exibição na tela.

---

## 📋 Pré-requisitos

Antes de rodar o projeto, certifique-se de ter instalado em sua máquina:
* Node.js (versão LTS recomendada)
* Git (para clonar o repositório)

---
## 🛠️ Como Rodar o Projeto

### 1. Baixar o Projeto (Clonar)
Abra o seu terminal e execute os comandos abaixo para baixar os arquivos e entrar na pasta:
```
git clone https://github.com/LuisTorres2009/SmartHomeMQTT
cd SmartHomeMQTT
```

---

### 2. Configurar as Variáveis de Ambiente (.env)
Na raiz do projeto (mesma pasta onde fica o package.json), crie um arquivo chamado exatamente ``.env``. 
Abra o arquivo e cole as credenciais abaixo, preenchendo com as informações do seu Broker MQTT:

```
EXPO_PUBLIC_MQTT_HOST=seu-cluster.hivemq.cloud  
EXPO_PUBLIC_MQTT_PORT=8884  
EXPO_PUBLIC_MQTT_PATH=/mqtt  
EXPO_PUBLIC_MQTT_USER=seu_usuario  
EXPO_PUBLIC_MQTT_PASS=sua_senha
```

Nota de Segurança: O arquivo ``.env`` está incluído no .gitignore e não é enviado para o GitHub, protegendo as suas senhas.

---

### 3. Instalar as Dependências
Com o terminal aberto na pasta do projeto, execute o comando abaixo para baixar todas as bibliotecas necessárias automaticamente:

```
npm install

```

---

### 4. Executar o Servidor Expo
Inicie o Metro Bundler limpando o cache para garantir que todo o projeto seja carregado perfeitamente:

```
npx expo start --clear

```

---

### 5. Visualizar o Aplicativo
* No Navegador (Web): Assim que o QR Code aparecer no seu terminal, pressione a tecla "w" no seu teclado para abrir a tela no navegador.

---

## 👨‍💻 Autor

Projeto desenvolvido por **Luis**.
