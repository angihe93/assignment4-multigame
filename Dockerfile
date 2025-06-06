FROM oven/bun:latest

WORKDIR /app

COPY . .

RUN bun install

EXPOSE 3000

# RUN NODE_ENV=production bun run server.ts 
ENV NODE_ENV=production
CMD ["bun", "run", "server.ts"]
