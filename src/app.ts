import cors from "cors";
import "dotenv/config";
import express, { Express, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { validateDbAvailability } from "./controllers/appwrite.controller";
import { apiV2Route } from "./routes/apiv2.route";
import { baseRoutes } from "./routes/base.route";

const app: Express = express();

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 8000;

type GlobalCatchMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

const globalCatch: GlobalCatchMiddleware = (error, req, res, next) => {
  res.status(500).json({
    success: true,
    message: "Internal server error",
  });
};

app.use("/", baseRoutes);
app.use("/api/v2", apiV2Route);

// global catch
app.use(globalCatch);

app.listen(PORT, async () => {
  await validateDbAvailability();
  console.log(`Express server is listening on PORT ${PORT}`);
});
