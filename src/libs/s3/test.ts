import { s3Service } from './index';

// Test S3 connection and basic operations
async function testS3Connection() {
  try {
    console.log('Testing S3 connection...');
    
    // Test listing files (this should work even with empty bucket)
    const files = await s3Service.listFiles('', 1);
    console.log('✅ S3 connection successful');
    console.log('Files in bucket:', files.length);
    
    // Test generating a presigned URL
    const presignedUrl = await s3Service.generatePresignedUploadUrl(
      'test/test-file.txt',
      'text/plain',
      3600
    );
    console.log('✅ Presigned URL generation successful');
    console.log('Presigned URL:', presignedUrl.substring(0, 100) + '...');
    
    return true;
  } catch (error) {
    console.error('❌ S3 connection failed:', error);
    return false;
  }
}

// Test base64 image upload
async function testBase64Upload() {
  try {
    console.log('Testing base64 image upload...');
    
    // Create a simple 1x1 pixel PNG image in base64
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const result = await s3Service.uploadBase64Image(
      base64Image,
      'test',
      'test-image.png'
    );
    
    console.log('✅ Base64 image upload successful');
    console.log('Uploaded file URL:', result.url);
    console.log('File key:', result.key);
    
    // Clean up - delete the test file
    await s3Service.deleteFile(result.key);
    console.log('✅ Test file deleted');
    
    return true;
  } catch (error) {
    console.error('❌ Base64 image upload failed:', error);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting S3 integration tests...\n');
  
  const connectionTest = await testS3Connection();
  if (!connectionTest) {
    console.log('\n❌ Connection test failed. Please check your AWS credentials and bucket configuration.');
    return;
  }
  
  console.log('\n');
  const uploadTest = await testBase64Upload();
  
  console.log('\n📊 Test Results:');
  console.log(`Connection Test: ${connectionTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Upload Test: ${uploadTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (connectionTest && uploadTest) {
    console.log('\n🎉 All tests passed! S3 integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the error messages above.');
  }
}

// Export for use in other files
export { testS3Connection, testBase64Upload, runTests };

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
} 