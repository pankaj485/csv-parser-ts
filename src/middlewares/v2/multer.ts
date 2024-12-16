import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const fileUploadPath = path.resolve(__dirname, "../../../public/uploads");

const storageConfig: multer.StorageEngine = multer.diskStorage({
  destination: fileUploadPath,
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const validateUploadDir = () => {
  if (!fs.existsSync(fileUploadPath)) {
    fs.mkdirSync(fileUploadPath, { recursive: true });
  }
};

const isValidFileFormat = (
  file: Express.Multer.File,
  format: string
): boolean => {
  const fileForamt = file.mimetype;
  return fileForamt === format;
};

const csvUploadConfig = multer({ storage: storageConfig }).single("csvfile");

export { csvUploadConfig, validateUploadDir, isValidFileFormat };
