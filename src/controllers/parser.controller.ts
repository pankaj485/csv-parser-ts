import { parse } from "csv-parse";
import "dotenv/config";
import { Request, Response } from "express";
import fs from "fs";
import sdk from "node-appwrite";
import { ParsedData } from "../types/parser";
import { parserConfig as configs } from "../utils/parserconfig";
import { z } from "zod";

const { APPWRITE_API_KEY, APPWRITE_BUCKET_ID, APPWRITE_PROJECT_ID } =
  process.env;

const client = new sdk.Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const storage = new sdk.Storage(client);

const parseCsv = async (req: Request, res: Response) => {
  const { filePath, headerRow } = configs;
  let parsedData: string[][] = [];

  if (!fs.existsSync(filePath)) {
    return res.status(400).json({
      success: false,
      message: "File not found",
    });
  }

  try {
    const fileData = new Promise<ParsedData[]>((resolve) => {
      try {
        fs.createReadStream(filePath)
          .pipe(
            parse({
              delimiter: ",",
            })
          )
          .on("data", (data: string[]) => {
            parsedData.push(data);
          })
          .on("end", () => {
            const headerIndex = headerRow - 1;
            const headers: string[] = parsedData[headerIndex];
            const responseData: { [key: string]: string }[] = [];

            parsedData.forEach((currentRowData, rowIndex) => {
              if (rowIndex !== headerIndex) {
                const data: any = {};

                headers.forEach((currentHeader, currentHeaderIndex) => {
                  if (currentHeader.length > 0) {
                    data[currentHeader] = currentRowData[currentHeaderIndex];
                  }
                });
                responseData.push(data);
              }
            });

            resolve(responseData);
          });
      } catch (err) {
        resolve([]);
      }
    });

    const data: ParsedData[] = await fileData;

    return res.status(200).json({
      success: true,
      message: "CSV file parsed",
      rowsParsed: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};

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

    const commaSeparatedData = data.split("\r");
    const headers = commaSeparatedData[0].split(",");

    return res.status(200).json({
      success: true,
      message: "headers retrived",
      headers,
    });
  } catch (error) {
    return;
  }
};

export { getCsvHeaders, parseCsv };
