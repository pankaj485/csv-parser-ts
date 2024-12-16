import { Request, Response } from "express";
import {
  csvUploadConfig,
  isValidFileFormat,
  validateUploadDir,
} from "../../middlewares/v2/multer";
import {
  getFileDataByIdV2,
  getFileHeadersByIdV2,
  uploadCsvFileV2,
} from "./appwrite.controller";
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
    const { file_id, header_row } = req.body;
    const fileHeaders = await getFileHeadersByIdV2(file_id, header_row);

    return res.status(200).json({
      success: true,
      message: "File headers received successfully",
      data: fileHeaders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error getting file header",
    });
  }
};

const getFileDataByHeaders = async (req: Request, res: Response) => {
  try {
    const { file_id, header_row } = req.body;
    const fileHeaders = await getFileHeadersByIdV2(file_id, header_row);
    const fileData = await getFileDataByIdV2(file_id);

    const headersSchema = z.object({
      headers: z
        .string({
          required_error: "At least one header required",
          invalid_type_error: "headers should be array of string",
        })
        .array()
        .min(1),
    });

    const reqBody = headersSchema.safeParse(req.body);
    if (!reqBody.success) {
      return res.status(400).json({
        success: false,
        message: reqBody.error.errors,
      });
    }

    const { headers: requestedHeaders } = reqBody.data;

    const getValidHeaders = (
      fileHeaders: string[],
      requestedHeaders: string[]
    ) => {
      const requestedSet = new Set(requestedHeaders);
      const res: { [key: string]: number } = {};
      fileHeaders
        .filter((header) => requestedSet.has(header))
        .forEach((header) => {
          res[header] = fileHeaders.indexOf(header);
        });

      return res;
    };

    const validHeaders = getValidHeaders(fileHeaders, requestedHeaders);

    if (!Object.keys(validHeaders).length) {
      return res.status(400).json({
        success: false,
        message: "invalid headers. At least 1 valid header required",
      });
    }

    let parsedData: {
      [key: string]: string;
    }[] = [];

    fileData.forEach((rowData, rowIndex) => {
      const currentRowData = rowData.split(",");
      const isCurrentRowDataValid =
        rowIndex > header_row - 1 &&
        currentRowData.length === fileHeaders.length;

      if (isCurrentRowDataValid) {
        const parsedCurrentRowData: { [key: string]: string } = {};
        Object.entries(validHeaders).forEach(([header, headerIndex]) => {
          parsedCurrentRowData[header] = currentRowData[headerIndex];
        });
        parsedData.push(parsedCurrentRowData);
      }
    });

    return res.status(200).json({
      success: true,
      message: "File parsed successfully",
      data: parsedData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error getting file header",
    });
  }
};

export { uploadCsvFile, getFileHeaders, getFileDataByHeaders };
