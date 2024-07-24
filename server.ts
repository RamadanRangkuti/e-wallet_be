import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import * as dotenv from "dotenv";
import morgan from "morgan";

dotenv.config();

import router from "./src/routes";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());
const configs: CorsOptions = {
  origin: ["http://localhost:8080", "https://e-wallet-fe-pi.vercel.app/"],
  methods: ["POST", "PATCH"],
  allowedHeaders: ["Authorization", "x-headers", "Content-Type"],
};

//logger
const logger = morgan("dev");
app.use(logger);

app.use(express.static("./public/images"));

app.get("/", (req: Request, res: Response) => {
  res.send("Tes");
})

app.use('/api/v1', router);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Backend successfully running on port ${PORT}`);
});

export default app;