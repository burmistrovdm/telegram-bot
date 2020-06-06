FROM node:lts

# создание директории приложения
WORKDIR /usr/src/app

# установка зависимостей
# символ астериск ("*") используется для того чтобы по возможности 
# скопировать оба файла: package.json и package-lock.json
COPY package*.json ./

RUN npm install
# Если вы создаете сборку для продакшн
# RUN npm ci --only=production

RUN npm run prebuild 
RUN npm run build

# копируем исходный код
COPY . .

CMD [ "node", "dist/index.js" ]