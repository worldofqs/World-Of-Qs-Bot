FROM node:lts-buster

RUN git clone https://github.com/Adeel-Xtech/ADEEL-MD.git /root/adeel-bot

WORKDIR /root/adeel-bot

RUN apt-get update && \
    apt-get install -y ffmpeg imagemagick webp && \
    rm -rf /var/lib/apt/lists/*

RUN npm install && npm install -g pm2

EXPOSE 9090

CMD ["npm", "start"]
