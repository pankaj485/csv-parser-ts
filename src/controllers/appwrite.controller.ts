import sdk, { ID, InputFile, Permission, Query, Role } from "node-appwrite";
import fs from "node:fs";

const {
  APPWRITE_API_KEY,
  APPWRITE_BUCKET_ID,
  APPWRITE_PROJECT_ID,
  APPWRITE_DB_ID,
  APPWRITE_COLLECTION_ID,
} = process.env;

const client = new sdk.Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const storage = new sdk.Storage(client);
const databases = new sdk.Databases(client);

interface FileData {
  filename: string;
  date: Date;
}

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

    fs.unlinkSync(file.path);

    await insertFileData({
      filename: fileName,
      date: new Date(),
    });

    return fileUploadRes.$id;
  } catch (error) {
    console.log("error uploading file to bucket: ", error);
    return false;
  }
};

const getFileHeadersById = async (fileId: string, header_row: number) => {
  const fileBuffer = await storage.getFileView(APPWRITE_BUCKET_ID, fileId);
  const data = fileBuffer.toString("utf-8");
  const fileHeaders = data.split("\r\n")[header_row - 1];
  return fileHeaders.split(",");
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

const getFileDataById = async (fileId: string) => {
  const fileBuffer = await storage.getFileView(APPWRITE_BUCKET_ID, fileId);
  const data = fileBuffer.toString("utf-8");
  const fileData = data.split("\r\n");
  return fileData;
};

const getFilesList = async () => {
  try {
    const query: string[] = [Query.orderDesc("$createdAt"), Query.limit(150)];
    const filesList = await storage.listFiles(APPWRITE_BUCKET_ID, query);

    return filesList.files.map((file) => {
      return {
        uploaded_at: file.$createdAt.split("T")[0],
        file_name: file.name,
      };
    });
  } catch (error) {
    return null;
  }
};

const validateDbAvailability = async () => {
  const dbExists = async () => {
    try {
      const db = await databases.get(APPWRITE_DB_ID);
      return db.name;
    } catch (error) {
      return false;
    }
  };

  const collectionExists = async () => {
    try {
      const collection = await databases.getCollection(
        APPWRITE_DB_ID,
        APPWRITE_COLLECTION_ID
      );
      return collection.name;
    } catch (error) {
      return false;
    }
  };

  try {
    const existsDB = await dbExists();
    const existsCol = await collectionExists();

    if (!existsDB) {
      await databases.create(APPWRITE_DB_ID, "csv-files", true);
    }

    if (!existsCol) {
      await databases.createCollection(
        APPWRITE_DB_ID,
        APPWRITE_COLLECTION_ID,
        "csv-files-data",
        [Permission.create(Role.any()), Permission.read(Role.any())],
        false,
        true
      );

      await databases.createStringAttribute(
        APPWRITE_DB_ID,
        APPWRITE_COLLECTION_ID,
        "filename",
        100,
        true,
        undefined,
        false,
        false
      );

      await databases.createDatetimeAttribute(
        APPWRITE_DB_ID,
        APPWRITE_COLLECTION_ID,
        "date",
        true,
        undefined,
        false
      );
    }
  } catch (error) {
    console.log("Error validating DB availability");
  }
};

const insertFileData = async (data: FileData) => {
  try {
    await databases.createDocument(
      APPWRITE_DB_ID,
      APPWRITE_COLLECTION_ID,
      ID.unique(),
      data
    );
  } catch (error) {
    console.log("eror inserting file data");
  }
};

export {
  getFileDataById as getFileDataByIdV2,
  getFileHeadersById as getFileHeadersByIdV2,
  getFilesList as getFilesListV2,
  uploadFile as uploadCsvFileV2,
  validateDbAvailability,
};
