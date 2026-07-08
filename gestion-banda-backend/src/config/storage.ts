import multer from 'multer';
import fs from 'fs';

const dirArchivos = './archivos_musicales';
if (!fs.existsSync(dirArchivos)){
    fs.mkdirSync(dirArchivos);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dirArchivos);
  },
  filename: (req, file, cb) => {
    const nombreUnico = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, nombreUnico);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Formato no soportado. Solo se permiten archivos PDF.'), false);
  }
};

export const upload = multer({ storage, fileFilter });