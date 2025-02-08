import { Request, Response } from "express";
import { getFileStatsData } from "../utils/appwrite";

const getFilesStat = async (req: Request, res: Response) => {
  try {
    const fileStats = await getFileStatsData();

    return res.status(200).json({
      success: true,
      message: "file stats received",
      stats: fileStats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error getting file stats",
    });
  }
};

export { getFilesStat };
