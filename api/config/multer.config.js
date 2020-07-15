// const multer = require('multer');
 
// // var storage = multer.memoryStorage()
// // var upload = multer({storage: storage});

// const storage = multer.memoryStorage(
//   {
//     filename: function (req, file, cb) {
//       cb(null, file.originalname)
//     } 
//   }
// )
 
// var upload = multer({ storage: storage })
// // router.post('/uploadSingleFile', upload.single("file"), (req, res)=>{
// //   console.log(req.file)
// // })
 
// module.exports = upload;