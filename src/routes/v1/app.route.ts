import express, { Router } from "express";
import { sayHello } from "../../controllers/app.controller";
import { parseCsv } from "../../controllers/parser.controller";
import {
  parseDataByHeaders,
  uploadFile,
} from "../../controllers/appwrite.controller";
import { upload } from "../../middlewares/multer";

const router: Router = express.Router();

router.get("/", sayHello);
router.get("/csv-parser", parseCsv);
router.post("/get-csv-data-by-headers", parseDataByHeaders);
router.post("/upload-file", upload.single("csvfile"), uploadFile);

export { router as apiV1AppRoute };
