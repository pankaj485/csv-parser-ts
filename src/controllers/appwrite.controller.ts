import { ID, InputFile, Query } from "node-appwrite";
import fs from "node:fs";
import {
  databases,
  getBucketfiles,
  storage,
  validateBucketCapacity,
} from "../utils/appwrite";

const {
  APPWRITE_BUCKET_ID,
  APPWRITE_DB_ID,
  APPWRITE_FILES_DATA_COL_ID,
  APPWRITE_FILES_COUNTS_COL_ID,
} = process.env;

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

    await insertFileStatData();

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

const insertFileData = async (data: { filename: string; date: Date }) => {
  try {
    await databases.createDocument(
      APPWRITE_DB_ID,
      APPWRITE_FILES_DATA_COL_ID,
      ID.unique(),
      data
    );
  } catch (error) {
    console.log("eror inserting file data");
  }
};

const insertFileStatData = async () => {
  const getMatchingDoc = async (data: { year: number; month: number }) => {
    return await databases.listDocuments(
      APPWRITE_DB_ID,
      APPWRITE_FILES_COUNTS_COL_ID,
      [Query.equal("year", data.year), Query.equal("month", data.month)]
    );
  };

  const currentDate = new Date();
  const data = {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  };

  const matchingDocuments = await getMatchingDoc(data);

  if (matchingDocuments.total === 0) {
    await databases.createDocument(
      APPWRITE_DB_ID,
      APPWRITE_FILES_COUNTS_COL_ID,
      ID.unique(),
      { ...data, count: 1 }
    );

    return;
  }

  const validDocument: any = matchingDocuments.documents[0];
  const documentId = validDocument.$id;
  const currentCount: number = validDocument["count"];

  await databases.updateDocument(
    APPWRITE_DB_ID,
    APPWRITE_FILES_COUNTS_COL_ID,
    documentId,
    { ...data, count: currentCount + 1 }
  );
};

export {
  getFileDataById as getFileDataByIdV2,
  getFileHeadersById as getFileHeadersByIdV2,
  getFilesList as getFilesListV2,
  uploadFile as uploadCsvFileV2,
};
