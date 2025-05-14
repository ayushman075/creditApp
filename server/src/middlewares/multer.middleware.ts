import multer from "multer";
import { Request } from "express";


const storage = multer.diskStorage({
    destination: function (req:Request, file:Express.Multer.File, cb:Function) {
      cb(null, './public/uploads')
    },
    filename: function (req:Request, file:Express.Multer.File, cb:Function) {
      if(file){
      const uniqueSuffix = Date.now()  + Math.round(Math.random() * 1E9)
    let fileFormat= file.mimetype.split('/')
      cb(null, file.fieldname  + uniqueSuffix+'.'+fileFormat[fileFormat.length-1])
    
      }
    }
  })
  
 export const upload = multer({ storage: storage })