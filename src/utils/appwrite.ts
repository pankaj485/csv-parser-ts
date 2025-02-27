import sdk, { Models, Permission, Query, Role } from "node-appwrite";
const {
  APPWRITE_API_KEY,
  APPWRITE_PROJECT_ID,
  APPWRITE_DB_ID,
  APPWRITE_FILES_DATA_COL_ID,
  APPWRITE_FILES_COUNTS_COL_ID,
} = process.env;

const client = new sdk.Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const storage = new sdk.Storage(client);
const databases = new sdk.Databases(client);

const validateDBExits = async (databaseID: string) => {
  try {
    const db = await databases.get(databaseID);
    return db.name;
  } catch (error) {
    return false;
  }
};

const validateCollectionExists = async (
  databaseID: string,
  collectionID: string
) => {
  try {
    const collection = await databases.getCollection(databaseID, collectionID);
    return collection.name;
  } catch (error) {
    return false;
  }
};

const createBucket = async (bucketId: string) => {
  try {
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
      bucketId,
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
  } catch (error) {
    return false;
  }
};

const validateBucketCapacity = async (bucketID: string) => {
  try {
    const { total } = await storage.listFiles(bucketID);

    if (total > 120) {
      await storage.deleteBucket(bucketID);
      return createBucket(bucketID);
    }

    return true;
  } catch (error) {
    console.log("error validating bucket", error);

    return false;
  }
};

const getBucketfiles = async (bucketId: string): Promise<Models.FileList> => {
  try {
    const query: string[] = [Query.orderDesc("$createdAt"), Query.limit(150)];
    const filesList = await storage.listFiles(bucketId, query);

    return filesList;
  } catch (err) {
    return {
      total: 0,
      files: [],
    };
  }
};

const validateFileDataCollection = async () => {
  try {
    const existsDB = await validateDBExits(APPWRITE_DB_ID);
    const existsCol = await validateCollectionExists(
      APPWRITE_DB_ID,
      APPWRITE_FILES_DATA_COL_ID
    );

    if (!existsDB) {
      await databases.create(APPWRITE_DB_ID, "csv-files", true);
    }

    if (!existsCol) {
      await databases.createCollection(
        APPWRITE_DB_ID,
        APPWRITE_FILES_DATA_COL_ID,
        "csv-files-data",
        [Permission.create(Role.any()), Permission.read(Role.any())],
        false,
        true
      );

      await databases.createStringAttribute(
        APPWRITE_DB_ID,
        APPWRITE_FILES_DATA_COL_ID,
        "filename",
        100,
        true,
        undefined,
        false,
        false
      );

      await databases.createDatetimeAttribute(
        APPWRITE_DB_ID,
        APPWRITE_FILES_DATA_COL_ID,
        "date",
        true,
        undefined,
        false
      );
    }
  } catch (error) {
    console.log("Error validating files DB availability");
  }
};

const validateFileCountCollection = async () => {
  try {
    const dbExists = await validateDBExits(APPWRITE_DB_ID);
    const colExists = await validateCollectionExists(
      APPWRITE_DB_ID,
      APPWRITE_FILES_COUNTS_COL_ID
    );

    if (!dbExists) {
      await databases.create(APPWRITE_DB_ID, "csv-files", true);
    }

    if (!colExists) {
      console.log("files count DB collection doesn't exists creating");
      await databases.createCollection(
        APPWRITE_DB_ID,
        APPWRITE_FILES_COUNTS_COL_ID,
        "csv-files-count",
        [Permission.create(Role.any()), Permission.read(Role.any())],
        false,
        true
      );

      await databases.createIntegerAttribute(
        APPWRITE_DB_ID,
        APPWRITE_FILES_COUNTS_COL_ID,
        "year",
        true,
        undefined,
        undefined,
        undefined,
        false
      );

      await databases.createIntegerAttribute(
        APPWRITE_DB_ID,
        APPWRITE_FILES_COUNTS_COL_ID,
        "month",
        true,
        1,
        12,
        undefined,
        false
      );

      await databases.createIntegerAttribute(
        APPWRITE_DB_ID,
        APPWRITE_FILES_COUNTS_COL_ID,
        "count",
        true,
        0,
        undefined,
        undefined,
        false
      );
    }
  } catch (error) {
    console.log(error);
    console.log("Error validating files count DB availability");
  }
};

const getFileStatsData = async (): Promise<{
  [key: number]: {
    [key: number]: number;
  };
}> => {
  try {
    const data = await databases.listDocuments(
      APPWRITE_DB_ID,
      APPWRITE_FILES_COUNTS_COL_ID,
      [Query.select(["year", "month", "count"])]
    );

    let finalData: {
      [key: number]: {
        [key: number]: number;
      };
    } = {};

    data.documents
      .map((stat: any) => ({
        year: stat.year,
        month: stat.month,
        count: stat.count,
      }))
      .forEach((stat) => {
        const { count, month, year } = stat;

        if (!finalData[year]) {
          finalData[year] = Array(12).fill(0);
        }

        finalData[year][month - 1] = count;
      });

    return finalData;
  } catch (error) {
    console.log("error getting files stat data");
    return {};
  }
};

export {
  databases,
  getBucketfiles,
  getFileStatsData,
  storage,
  validateBucketCapacity,
  validateCollectionExists,
  validateDBExits,
  validateFileCountCollection,
  validateFileDataCollection,
};
