import { Request, Response } from "express";
import {
  csvUploadConfig,
  isValidFileFormat,
  validateUploadDir,
} from "../../middlewares/v2/multer";
import { getFileDataByIdV2, uploadCsvFileV2 } from "./appwrite.controller";
import { z } from "zod";

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

      const uploadRes = await uploadCsvFileV2(csvFile);

      if (!uploadRes) {
        return res.status(500).json({
          success: false,
          message: "Error uploading file",
        });
      }

      return res.status(200).json({
        success: true,
        messge: "File uploaded successfully",
        fileId: uploadRes,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error uploading file",
    });
  }
};

const getFileHeaders = async (req: Request, res: Response) => {
  try {
    const shema = z.object({
      file_id: z.string({
        required_error: "File Id is required",
        invalid_type_error: "File Id must be a string",
      }),
      header_row: z
        .number({
          invalid_type_error: "Header row must be greater than or equal to 1",
        })
        .gte(1)
        .default(1),
    });

    const requestBody = shema.safeParse(req.body);

    if (!requestBody.success) {
      return res.status(400).json({
        success: false,
        message: requestBody.error.errors,
      });
    }

    const { file_id, header_row } = requestBody.data;
    const fileHeaders = await getFileDataByIdV2(file_id, header_row);

    return res.status(200).json({
      success: true,
      message: "File headers received successfully",
      data: fileHeaders.split(","),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error getting file header",
    });
  }
};

export { uploadCsvFile, getFileHeaders };
