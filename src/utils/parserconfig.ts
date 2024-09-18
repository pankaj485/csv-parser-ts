import path from "path";
import { ParserConfig } from "../types/parser";

export const parserConfig: ParserConfig = {
  headerRow: 1,
  filePath: path.resolve(__dirname, "../../public/graph-mapping.csv"),
};
