import express from "express";
import { ENV } from "./lib/env.js";

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({
    mes: "success from api",
  });
});

app.listen(ENV.PORT, () => console.log(`Sever is running on: ${ENV.PORT}`));
