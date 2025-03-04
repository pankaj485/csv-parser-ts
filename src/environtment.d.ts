import { z } from "zod";

const envSchema = z.object({
  APPWRITE_API_KEY: z.string(),
  APPWRITE_BUCKET_ID: z.string(),
  APPWRITE_PROJECT_ID: z.string(),
  APPWRITE_FILES_DATA_COL_ID: z.string(),
  APPWRITE_FILES_COUNTS_COL_ID: z.string(),
  APPWRITE_DB_ID: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
