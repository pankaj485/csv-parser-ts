import { Request, Response, Router } from "express";

const router = Router();

const baseURL = "https://csv-parser-ts.koyeb.app";
const apiVersion = "api/v2";

const APIS = {
  upload: `POST: ${baseURL}/${apiVersion}/file-upload`,
  headers: `POST: ${baseURL}/${apiVersion}/get-file-headers`,
  data: `POST: ${baseURL}/${apiVersion}/get-file-data`,
  list: `GET: ${baseURL}/${apiVersion}/get-files-list`,
};

router.get("", (req: Request, res: Response) => {
  return res.status(200).json({
    [APIS.upload]: "upload csv file",
    [APIS.headers]: "get file headers",
    [APIS.data]: "get file data",
    [APIS.list]: "get list of uploaded files",
  });
});

export { router as baseRoutes };
