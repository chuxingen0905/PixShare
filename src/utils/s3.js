import { Auth } from 'aws-amplify';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function getPhotoUrl(key) {
  const credentials = await Auth.currentCredentials();

  const s3 = new S3Client({
    region: 'ap-southeast-5',
    credentials
  });

  const command = new GetObjectCommand({
    Bucket: 'pixphotos',
    Key: key
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return url;
}