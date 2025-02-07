import { ID, InputFile, Permission, Role } from "node-appwrite";
import fs from "node:fs";
import {
  databases,
  getBucketfiles,
  storage,
  validateBucketCapacity,
  validateCollectionExists,
  validateDBExits,
} from "../utils/appwrite";

const { APPWRITE_BUCKET_ID, APPWRITE_DB_ID, APPWRITE_COLLECTION_ID } =
  process.env;

const uploadFile = async (file: Express.Multer.File) => {
  try {
    const isStorageAvailable = await validateBucketCapacity(APPWRITE_BUCKET_ID);
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

const getFileDataById = async (fileId: string) => {
  const fileBuffer = await storage.getFileView(APPWRITE_BUCKET_ID, fileId);
  const data = fileBuffer.toString("utf-8");
  const fileData = data.split("\r\n");
  return fileData;
};

const getFilesList = async () => {
  try {
    const filesList = await getBucketfiles(APPWRITE_BUCKET_ID);

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
  try {
    const existsDB = await validateDBExits(APPWRITE_DB_ID);
    const existsCol = await validateCollectionExists(
      APPWRITE_DB_ID,
      APPWRITE_COLLECTION_ID
    );

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

const insertFileData = async (data: { filename: string; date: Date }) => {
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
