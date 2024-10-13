import path from "node:path";
import fs from "node:fs";
import multer from "multer";

const fileUploadPath = path.resolve(__dirname, "../../public/uploads");

const upload = multer({
  storage: multer.diskStorage({
    destination: fileUploadPath,
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix);
    },
  }),
});

const validateUploadDir = () => {
  if (!fs.existsSync(fileUploadPath)) {
    console.log("upload path doesn't exist. Creating it");
    fs.mkdirSync(fileUploadPath, { recursive: true });
  } else {
    console.log("uplod path already exists", fileUploadPath);
  }
};

export { validateUploadDir, fileUploadPath, upload };
