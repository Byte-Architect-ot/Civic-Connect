FROM node:20-slim

WORKDIR /app

# Install build tools for native module compilation (e.g., bcrypt)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "server.js"]
