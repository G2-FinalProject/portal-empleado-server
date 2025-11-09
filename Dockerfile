# Usa una imagen base ligera de Node 20
FROM node:20-bookworm-slim

# Crea y usa el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia dependencias y las instala
COPY package*.json ./
RUN npm ci

# Copia el resto del código
COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts

# Instala tsx para ejecutar TS directamente
RUN npm i -g tsx

# Expone el puerto 3000
EXPOSE 3000

# Comando para arrancar tu servidor
CMD ["tsx", "src/app.ts"]
