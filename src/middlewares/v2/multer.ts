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

const isValidFileFormat = (args: {
  file: Express.Multer.File;
  mimeType: string;
  extension: string;
}): boolean => {
  const {
    file: { mimetype, originalname: fileName },
    extension,
    mimeType,
  } = args;
  const isValidExtension =
    fileName.split(".")[fileName.split(".").length - 1] === extension;

  return mimetype === mimeType || !isValidExtension;
};

const csvUploadConfig = multer({ storage: storageConfig }).single("csvfile");

export { csvUploadConfig, validateUploadDir, isValidFileFormat };
