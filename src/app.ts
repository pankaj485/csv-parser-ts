const express = require("express");
import { Express, NextFunction, Request, Response } from "express";
import { apiV1AppRoute } from "./routes/v1/app.route";

const app: Express = express();
app.use(express.json());
const PORT = 3000;

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

app.use("/api/v1", apiV1AppRoute);

// global catch
app.use(globalCatch);

app.listen(PORT, () => {
  console.log(`Express server is listening on PORT ${PORT}`);
});
