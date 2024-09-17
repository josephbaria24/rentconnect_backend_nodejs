require('dotenv').config();
const B2 = require('backblaze-b2');

// Initialize B2 with credentials
const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

// Upload File Function (handles buffer directly)
const uploadFileToB2 = async (fileBuffer, fileName) => {
    try {
        // Authenticate with B2
        await b2.authorize();

        // Get upload URL for the specified bucket
        const bucketId = process.env.B2_BUCKET_ID;
        const uploadUrlResponse = await b2.getUploadUrl({ bucketId });

        // Upload the file to Backblaze B2
        const uploadResponse = await b2.uploadFile({
            uploadUrl: uploadUrlResponse.data.uploadUrl,
            uploadAuthToken: uploadUrlResponse.data.authorizationToken,
            fileName: fileName, // Name to save as in B2
            data: fileBuffer, // The file data to upload (buffer)
        });

        console.log('File uploaded successfully:', uploadResponse.data);
        return uploadResponse.data; // Return uploaded file's data
    } catch (error) {
        console.error('Error uploading file to Backblaze B2:', error);
        throw error;
    }
};

module.exports = { uploadFileToB2 };
