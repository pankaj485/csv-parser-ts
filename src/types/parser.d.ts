interface ParserConfig {
  headerRow: number;
  filePath: string;
}

interface ParsedData {
  [key: string]: string;
}

export { ParserConfig, ParsedData };
