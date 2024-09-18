import { Request, Response } from "express";
import fs from "fs";
import { parse } from "csv-parse";
import { parserConfig as configs } from "../utils/parserconfig";

const parseCsv = async (req: Request, res: Response) => {
  const { filePath, headerRow } = configs;
  let parsedData: any[] = [];

  if (!fs.existsSync(filePath)) {
    return res.status(400).json({
      success: false,
      message: "File not found",
    });
  }

  try {
    const fileData = new Promise<{ [key: string]: string }[]>((resolve) => {
      try {
        fs.createReadStream(filePath)
          .pipe(
            parse({
              delimiter: ",",
            })
          )
          .on("data", (data) => {
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

    const data = await fileData;

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
