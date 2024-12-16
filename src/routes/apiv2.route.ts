import express from "express";
import {
  getFileDataByHeaders,
  getFileHeaders,
  uploadCsvFile,
} from "../controllers/v2/upload.controller";
import { validateFilePayload } from "../middlewares/v2/upload.middleware";
const route = express.Router();

route.post("/upload-file", uploadCsvFile);
route.post("/get-file-headers", validateFilePayload, getFileHeaders);
route.post("/get-file-data", validateFilePayload, getFileDataByHeaders);

export { route as apiV2Route };
