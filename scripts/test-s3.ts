import dotenv from 'dotenv';
import { runTests } from '../src/libs/s3/test';

dotenv.config();

process.env.AWS_ACCESS_KEY_ID = 'AKIATLRIUUO3CXVL7ZWR';
process.env.AWS_SECRET_ACCESS_KEY = '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';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_BUCKET_NAME = 'cannbe-files-v1';

console.log('Setting up AWS credentials...');
console.log('Access Key ID:', process.env.AWS_ACCESS_KEY_ID?.substring(0, 10) + '...');
console.log('Region:', process.env.AWS_REGION);
console.log('Bucket:', process.env.AWS_BUCKET_NAME);
console.log('');

runTests().catch(console.error); 