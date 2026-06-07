import cors from "cors";
import express from "express";
import { serve } from "inngest/express";
import { fileURLToPath } from "url";
import path from "path";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { functions, inngest } from "./lib/inngest.js";
import { keepAliveRenderCron } from "./lib/cron.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");

// Middleware
app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    mes: "success from api",
  });
});

app.get("/api/books", (req, res) => {
  res.status(200).json({
    mes: "this is the books endpoint",
  });
});

// make our app ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(frontendDistPath));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      if (ENV.NODE_ENV === "production") {
        keepAliveRenderCron.start();
      }
      console.log(`Sever is running on: ${ENV.PORT}`);
    });
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();
