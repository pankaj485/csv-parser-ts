import { Request, Response } from "express";
import sdk, { ID, InputFile } from "node-appwrite";
import { z } from "zod";

const { APPWRITE_API_KEY, APPWRITE_BUCKET_ID, APPWRITE_PROJECT_ID } =
  process.env;

const client = new sdk.Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const storage = new sdk.Storage(client);

const parseDataByHeaders = async (req: Request, res: Response) => {
  try {
    const requestBodySchema = z.object({
      fileId: z
        .string({
          required_error: "File Id is required",
          invalid_type_error: "File Idmust be a string",
        })
        .trim(),
      headers: z
        .array(z.string(), {
          required_error: "At least 1 header required",
          invalid_type_error: "Headers must be a string",
        })
        .min(1),
    });

    const requestBody = requestBodySchema.safeParse(req.body);

    if (!requestBody.success) {
      return res.status(400).json({
        success: false,
        message: requestBody.error.errors,
      });
    }

    const { fileId, headers: requestedHeaders } = requestBody.data;

    const file = await storage.getFileView(APPWRITE_BUCKET_ID, fileId);

    const data = file.toString("utf-8");
    const headerIndex = 0;

    const commaSeparatedData = data.split("\r");
    const fileHeaders = commaSeparatedData[headerIndex].split(",");
    const validHeaders = requestedHeaders.filter((currentHeader) =>
      fileHeaders.includes(currentHeader)
    );

    if (!validHeaders.length) {
      return res.status(400).json({
        success: false,
        message: "invalid header info. At least 1 valid header required",
      });
    }

    let parsedData: {
      [key: string]: string;
    }[] = [];

    commaSeparatedData.forEach((currentRow, currentRowDataIndex) => {
      const currentRowData = currentRow.split(",");
      let data: {
        [key: string]: string;
      } = {};

      if (
        currentRowDataIndex > headerIndex &&
        currentRowData.length === fileHeaders.length
      ) {
        validHeaders.forEach((currentHeader, currentHeaderIndex) => {
          data[currentHeader] = String(
            currentRowData[currentHeaderIndex]
          ).trim();
        });

        parsedData.push(data);
      }
    });

    return res.status(200).json({
      success: true,
      message: "headers retrived",
      data: parsedData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error retriving headers",
    });
  }
};

const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: true,
        message: "file not uploaded",
      });
    }

    const fileName = req.file.originalname;
    const isValidFormat =
      fileName.split(".")[fileName.split(".").length - 1] === "csv";
    const isValidMimeType = req.file.mimetype === "text/csv";

    if (!isValidFormat || !isValidMimeType) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only .csv files are allowed",
      });
    }

    const fileUploadRes = await storage.createFile(
      APPWRITE_BUCKET_ID,
      ID.unique(),
      InputFile.fromPath(req.file.path, req.file.originalname)
    );

    const { $id: fileId } = fileUploadRes;

    const file = await storage.getFileView(APPWRITE_BUCKET_ID, fileId);
    const data = file.toString("utf-8");
    const headerIndex = 0;

    const commaSeparatedData = data.split("\r");
    const headers = commaSeparatedData[headerIndex].split(",");

    return res.status(200).json({
      success: true,
      message: "file uploaded",
      fileId,
      headers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error uploading file",
    });
  }
};

const listFiles = async (req: Request, res: Response) => {
  try {
    const files = (await storage.listFiles(APPWRITE_BUCKET_ID)).files;

    const data = files.map((file) => {
      return {
        name: file.name,
        fileId: file.$id,
        created_at: file.$createdAt,
      };
    });

    if (data.length > 25) {
      data.forEach(async (file) => {
        await storage.deleteFile(APPWRITE_BUCKET_ID, file.fileId);
      });
    }

    return res.status(200).json({
      success: true,
      message: "server is up and running",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "error getting files",
    });
  }
};

export { parseDataByHeaders, uploadFile, listFiles };
