import express, { type Request, type Response } from "express";
import { connectDb } from "./config/db";
import router from "./routes";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    msg: "Running...",
  });
});

app.use("/api", router);

app.listen(PORT, async () => {
  try {
    await connectDb();

    console.log("Connection to mongoDb is sucess");
  } catch (error) {
    console.error("Connection to DB failed");
    process.exit(1);
  }
});
