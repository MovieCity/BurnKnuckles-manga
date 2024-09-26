import express from "express";
import cors from "cors";
import parserRoutes from "./routes/routes.js";

const app = express();

app.use(cors());
app.use("/api/v1/", parserRoutes);

export default app;
