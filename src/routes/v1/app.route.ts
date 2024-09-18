import express, { Router } from "express";
import { sayHello } from "../../controllers/app.controller";

const router: Router = express.Router();

router.get("/", sayHello);

export { router as apiV1AppRoute };
