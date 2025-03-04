import express from "express";
import {
  getFileDataByHeaders,
  getFileHeaders,
  getFilesList,
  uploadCsvFile,
} from "../controllers/upload.controller";
import { validateFilePayload } from "../utils/middlewares";
import { getFilesStat } from "../controllers/analytics.controller";
const route = express.Router();

route.post("/upload-file", uploadCsvFile);
route.post("/get-file-headers", validateFilePayload, getFileHeaders);
route.post("/get-file-data", validateFilePayload, getFileDataByHeaders);
route.get("/get-files-stat", getFilesStat);
route.get("/get-files-list", getFilesList);

export { route as apiV2Route };
