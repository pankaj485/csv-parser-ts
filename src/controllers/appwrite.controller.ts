import { Request, Response } from "express";
import sdk from "node-appwrite";
import { z } from "zod";

const { APPWRITE_API_KEY, APPWRITE_BUCKET_ID, APPWRITE_PROJECT_ID } =
  process.env;

const client = new sdk.Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const storage = new sdk.Storage(client);

const getCsvHeaders = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.body;

    const fieldIdSchema = z
      .string({
        required_error: "FieldId is required",
        invalid_type_error: "FieldId must be a string",
      })
      .trim();

    const requestedFile = fieldIdSchema.safeParse(fileId);

    if (!requestedFile.success) {
      return res.status(400).json({
        success: false,
        message: requestedFile.error.errors[0].message,
      });
    }

    const file = await storage.getFileView(
      APPWRITE_BUCKET_ID,
      requestedFile.data
    );

    const data = file.toString("utf-8");
    const headerIndex = 0;

    const commaSeparatedData = data.split("\r");
    const headers = commaSeparatedData[headerIndex].split(",");
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
        currentRowData.length === headers.length
      ) {
        headers.forEach((currentHeader, currentHeaderIndex) => {
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
      headers,
      parsedData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error retriving headers",
    });
  }
};

export { getCsvHeaders };
