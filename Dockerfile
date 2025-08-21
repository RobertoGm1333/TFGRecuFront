# Version de node que si furula
FROM node:18 as construccion

WORKDIR /app

# Pillo archivos del json
COPY package*.json ./

# Instalo dependencias
RUN npm i

# Copio todos los archivos de la raiz (primer punto) al directorio actual (segundo punto),
COPY . .

# Modo build porque sino no tira
RUN npm run build 

# Etapa de producción,
FROM nginx:alpine as produccion

# Puerto de la derecha en el docker run, cuando se le añada certificado ssl habrá q cambiarlo al 443,
EXPOSE 80

# Comando para iniciar el nginx,
CMD ["nginx", "-g", "daemon off;"]