import { Request, Response, Router } from "express";

const router = Router();

router.get("", (req: Request, res: Response) => {
  return res.status(400).json({
    "GET: api/v1/": "endpoint to validate if server is running or not",
    "GET: api/v1/csv-parser": "parse file by uploading directly to disk",
    "POST: api/v1/get-csv-data-by-headers":
      "get json data based on provided headers",
    "POST: api/v1/upload-file": "upload file and get headers of the csv file",
    "GET: api/v1/list-files": "get list of uploaded files on bucket",
  });
});

export { router as baseRoutes };
