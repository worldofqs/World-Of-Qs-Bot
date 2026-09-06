FROM node:lts-bookworm

RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg imagemagick webp && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 9090

CMD ["npm", "start"]
