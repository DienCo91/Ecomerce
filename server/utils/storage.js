const AWS = require('aws-sdk');

const keys = require('../config/keys');

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

exports.s3Upload = async image => {
  try {
    let imageUrl = '';
    let imageKey = '';

    if (!keys.aws.accessKeyId) {
      console.warn('Missing aws keys');
    }

    if (image) {
      const s3bucket = new AWS.S3({
        accessKeyId: keys.aws.accessKeyId,
        secretAccessKey: keys.aws.secretAccessKey,
        region: keys.aws.region
      });

      const params = {
        Bucket: keys.aws.bucketName,
        Key: image.originalname,
        Body: image.buffer,
        ContentType: image.mimetype
      };

      const s3Upload = await s3bucket.upload(params).promise();

      imageUrl = s3Upload.Location;
      imageKey = s3Upload.key;
    }

    return { imageUrl, imageKey };
  } catch (error) {
    return { imageUrl: '', imageKey: '' };
  }
};

exports.localUpload = async image => {
  try {
    let imageUrl = '';
    let imageKey = '';

    if (image) {
      const uniqueFilename = `${uuidv4()}-${image.originalname}`;
      imageKey = uniqueFilename;

      const uploadDir = path.join(__dirname, '../public/uploads');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, uniqueFilename);
      fs.writeFileSync(filePath, image.buffer);

      imageUrl = `/uploads/${uniqueFilename}`;
    }

    return { imageUrl, imageKey };
  } catch (error) {
    console.error('File upload error:', error);
    return { imageUrl: '', imageKey: '' };
  }
};
