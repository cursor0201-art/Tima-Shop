FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* package-lock.json* yarn.lock* ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port (Vite default is 5173 but your config says 8080)
EXPOSE 8080

# Command to run development server
CMD ["npm", "run", "dev"]
