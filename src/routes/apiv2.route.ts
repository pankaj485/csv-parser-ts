import express from "express";
import {
  getFileHeaders,
  uploadCsvFile,
} from "../controllers/v2/upload.controller";
const route = express.Router();

route.post("/upload-file", uploadCsvFile);
route.post("/get-file-headers", getFileHeaders);

export { route as apiV2Route };
