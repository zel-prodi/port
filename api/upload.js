const fs = require('fs');
const AWS = require('aws-sdk');
 AWS.config = new AWS.Config({
     accessKeyId: 'AKIAJOUFR3FRCY7XFPCQ',
     secretAccessKey: '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',
     region: 'us-east-2'
 })
const s3 = new AWS.S3()

const uploadFile = (fileName) => {
    // Read content from the file
    const fileContent = fs.readFileSync(fileName);

    // Setting up S3 upload parameters
    const params = {
        Bucket: 'gcportal-testbucket',
        Key: 'a.jpg', // File name you want to save as in S3
        Body: fileContent
    };

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    });
};

uploadFile('a.jpg');