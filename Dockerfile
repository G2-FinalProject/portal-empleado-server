# --- Etapa 1: "Build" (Construir el proyecto) ---
# Usamos una imagen de Node 18 (puedes ajustarla)
FROM node:18-alpine AS builder

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package.json package-lock.json ./

# Instalamos TODAS las dependencias (incluidas las 'devDependencies' para compilar)
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Ejecutamos el script de "build" que tengas en tu package.json
# (Esto compila tu TypeScript de 'src' a 'dist')
RUN npm run build


# --- Etapa 2: "Final" (Ejecutar la aplicación) ---
# Empezamos desde una imagen de Node limpia y ligera
FROM node:18-alpine

WORKDIR /app

# Copiamos solo los package.json de nuevo
COPY package.json package-lock.json ./

# Instalamos SOLO las dependencias de producción
RUN npm install --only=production

# Copiamos el código compilado (la carpeta 'dist') desde la etapa "builder"
COPY --from=builder /app/dist ./dist

# Copiamos la configuración de reflect-metadata si es necesaria en producción
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Exponemos el puerto 3000 (lo leí en tu src/server.ts)
EXPOSE 3000

# El comando para arrancar la aplicación (basado en src/server.ts)
CMD [ "node", "dist/server.js" ]