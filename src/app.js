import express from "express";
import cors from "cors";
import parserRoutes from "./routes/routes.js";

const app = express();

app.use(cors());
app.get("/", (req, res) => {
   res.send([{"sucess": true, "bnc": "BurnKnuckles", "manga-api": "ready to shot some good white data"}]);
});

app.use(cors());
app.get("/genesis/evangelion", (req, res) => {
   res.send([{"sucess": true, "bnc": "BurnKnuckles", "manga-api": "ready to shot some good white data"}]);
});

app.use("/genesis/evangelion", parserRoutes);

export default app;
