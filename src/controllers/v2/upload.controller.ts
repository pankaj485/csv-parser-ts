import { Request, Response } from "express";
import {
  csvUploadConfig,
  isValidFileFormat,
  validateUploadDir,
} from "../../middlewares/v2/multer";

const uploadCsvFile = (req: Request, res: Response) => {
  validateUploadDir();

  try {
    csvUploadConfig(req, res, async (error) => {
      if (error) {
        console.log("error");
        return res.status(200).json({
          success: false,
          message: "Error uploading file",
        });
      }

      if (!req.file) {
        return res.status(200).json({
          success: false,
          message: "No file Uploaded",
        });
      }

      const csvFile = req.file;
      const isValidFile = isValidFileFormat({
        file: csvFile,
        extension: "csv",
        mimeType: "text/csv",
      });

      if (!isValidFile) {
        return res.status(200).json({
          success: false,
          message: "Invalid file foramt. Valid format: '.csv'",
        });
      }

      return res.status(200).json({
        success: true,
        messge: "File uploaded successfully",
        csvFile,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error uploading file",
    });
  }
};

export { uploadCsvFile };
