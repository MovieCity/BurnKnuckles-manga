import express from "express";
import parserRoutes from "./routes/routes.js";

const app = express();

app.use("/api/v1/", parserRoutes);

export default app;
