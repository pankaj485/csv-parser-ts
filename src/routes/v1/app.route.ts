import express, { Router } from "express";
import { sayHello } from "../../controllers/app.controller";
import { getCsvHeaders, parseCsv } from "../../controllers/parser.controller";

const router: Router = express.Router();

router.get("/", sayHello);
router.get("/csv-parser", parseCsv);
router.post("/get-csv-headers", getCsvHeaders);

export { router as apiV1AppRoute };
