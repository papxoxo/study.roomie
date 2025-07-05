# Simple production image
FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY src ./src
CMD ["node","src/server.js"]
