FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock) to the container
COPY package.json package-lock.json tsconfig.json /app/

# Install project dependencies
RUN npm install

# Copy project directory to the container
COPY prisma /app/prisma/
COPY benchmark /app/benchmark/
COPY src /app/src/

RUN npx prisma generate
# Run the build process using 'make build'
RUN npm run build

# Expose any required ports if your Node.js app listens on one
EXPOSE 8200

# Start your Node.js application
CMD [ "npm", "run", "start"]