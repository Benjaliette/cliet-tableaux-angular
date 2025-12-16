# Étape 1: Build de l'application Angular
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
# On utilise la configuration de production pour le build
RUN npm run build -- --configuration production

# Étape 2: Création de l'image finale avec Nginx
FROM nginx:alpine
# On copie les fichiers de build dans le répertoire de Nginx
COPY --from=build /app/dist/cliet-tableaux-angular/browser/ /usr/share/nginx/html/
# On copie une configuration Nginx personnalisée (voir ci-dessous)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
