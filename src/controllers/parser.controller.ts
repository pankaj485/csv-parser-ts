import { parse } from "csv-parse";
import "dotenv/config";
import path from "node:path";
import { Request, Response } from "express";
import fs from "fs";
import { ParsedData } from "../types/parser";
import { parserConfig as configs } from "../utils/parserconfig";

const parseCsv = async (req: Request, res: Response) => {
  const { filePath, headerRow } = configs;
  let parsedData: string[][] = [];

  if (!fs.existsSync(filePath)) {
    return res.status(400).json({
      success: false,
      message: `File not found. Make sure '${filePath}' exists`,
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

export { parseCsv };
