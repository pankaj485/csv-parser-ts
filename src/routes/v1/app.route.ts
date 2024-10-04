import express, { Router } from "express";
import { sayHello } from "../../controllers/app.controller";
import { parseCsv } from "../../controllers/parser.controller";
import {
  getCsvHeaders,
  parseDataByHeaders,
} from "../../controllers/appwrite.controller";

const router: Router = express.Router();

router.get("/", sayHello);
router.get("/csv-parser", parseCsv);
router.post("/get-csv-headers", getCsvHeaders);
router.post("/get-csv-data-by-headers", parseDataByHeaders);

export { router as apiV1AppRoute };
