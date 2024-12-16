import express from "express";
import { uploadCsvFile } from "../controllers/v2/upload.controller";
const route = express.Router();

route.post("/upload-file", uploadCsvFile);

export { route as apiV2Route };
