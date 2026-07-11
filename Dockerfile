FROM node:18-slim

# Instalar dependências do Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código
COPY evolution-api-setup.js .

# Criar pasta para sessão
RUN mkdir -p whatsapp-session

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["node", "evolution-api-setup.js"]
