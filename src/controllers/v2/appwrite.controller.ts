import sdk, { ID, InputFile } from "node-appwrite";
import fs from "node:fs";

const { APPWRITE_API_KEY, APPWRITE_BUCKET_ID, APPWRITE_PROJECT_ID } =
  process.env;

const client = new sdk.Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const storage = new sdk.Storage(client);

const uploadFile = async (file: Express.Multer.File) => {
  try {
    const isStorageAvailable = await validateStorageAvailability();
    const { originalname: fileName, size } = file;

    if (!isStorageAvailable) {
      return false;
    }

    const fileUploadRes = await storage.createFile(
      APPWRITE_BUCKET_ID,
      ID.unique(),
      InputFile.fromStream(fs.createReadStream(file.path), fileName, size)
    );

    return fileUploadRes.$id;
  } catch (error) {
    console.log("error uploading file to bucket: ", error);
    return false;
  }
};

const validateStorageAvailability = async () => {
  try {
    const { total } = await storage.listFiles(APPWRITE_BUCKET_ID);

    if (total > 120) {
      await storage.deleteBucket(APPWRITE_BUCKET_ID);

      const bucketConfig = {
        permissions: ['create("any")', 'read("any")'],
        fileSecurity: false,
        name: "csv-files",
        enabled: true,
        maximumFileSize: 50000000,
        allowedFileExtensions: ["csv"],
        compression: "none",
        encryption: true,
        antivirus: true,
      };

      await storage.createBucket(
        APPWRITE_BUCKET_ID,
        bucketConfig.name,
        bucketConfig.permissions,
        bucketConfig.fileSecurity,
        bucketConfig.enabled,
        bucketConfig.maximumFileSize,
        bucketConfig.allowedFileExtensions,
        bucketConfig.compression,
        bucketConfig.encryption,
        bucketConfig.antivirus
      );

      return true;
    }
    return true;
  } catch (error) {
    console.log("error validating bucket", error);

    return false;
  }
};

export { uploadFile as uploadCsvFileV2 };
