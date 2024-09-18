import path from "path";
import { ParserConfig } from "../types/parser";

const uploadPath = "../../public/graph-mapping.csv";

export const parserConfig: ParserConfig = {
  headerRow: 1,
  filePath: path.resolve(__dirname, uploadPath),
};
