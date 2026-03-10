import { buildServer } from "./server.js";

const PORT = parseInt(process.env.PORT || "3100", 10);
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://localhost:5432/agentgate";

async function main() {
  const server = await buildServer({ databaseUrl: DATABASE_URL });

  try {
    await server.listen({ port: PORT, host: "0.0.0.0" });
    server.log.info(`AgentGate API running on port ${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
