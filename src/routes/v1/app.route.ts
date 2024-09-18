import express, { Router } from "express";
import { sayHello } from "../../controllers/app.controller";
import { parseCsv } from "../../controllers/parser.controller";

const router: Router = express.Router();

router.get("/", sayHello);
router.get("/csv-parser", parseCsv);

export { router as apiV1AppRoute };
