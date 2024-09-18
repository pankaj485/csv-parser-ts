import path from "path";
interface ParserConfig {
  headerRow: number;
  filePath: string;
}

export const parserConfig: ParserConfig = {
  headerRow: 1,
  filePath: path.resolve(__dirname, "../../public/graph-mapping.csv"),
};
