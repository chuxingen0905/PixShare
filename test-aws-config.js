#!/usr/bin/env node

// Simple AWS Connection Test
// This script tests if your AWS services are properly configured

import { Amplify } from 'aws-amplify';
import { getCurrentUser } from 'aws-amplify/auth';
import awsconfig from './src/aws-exports.js';

console.log('🔍 Testing AWS Configuration...\n');

// Configure Amplify
try {
  Amplify.configure(awsconfig);
  console.log('✅ Amplify configured successfully');
} catch (error) {
  console.log('❌ Amplify configuration failed:', error.message);
  process.exit(1);
}

// Check configuration values
console.log('\n📋 Configuration Summary:');
console.log(`Region: ${awsconfig.aws_project_region}`);
console.log(`User Pool ID: ${awsconfig.aws_user_pools_id}`);
console.log(`App Client ID: ${awsconfig.aws_user_pools_web_client_id}`);
console.log(`GraphQL Endpoint: ${awsconfig.aws_appsync_graphqlEndpoint}`);
console.log(`S3 Bucket: ${awsconfig.aws_user_files_s3_bucket}`);

// Check if values are still placeholders
const hasPlaceholders = 
  awsconfig.aws_user_pools_id.includes('XXXXX') ||
  awsconfig.aws_user_pools_web_client_id.includes('XXXXX') ||
  awsconfig.aws_appsync_graphqlEndpoint.includes('XXXXX') ||
  awsconfig.aws_user_files_s3_bucket.includes('XXXXX');

if (hasPlaceholders) {
  console.log('\n⚠️  Warning: Your configuration still contains placeholder values!');
  console.log('   Please run the setup script or manually configure AWS resources.');
  console.log('   See AWS_SETUP.md for instructions.');
} else {
  console.log('\n✅ Configuration values look good!');
  console.log('   You should now be able to register users and see them in AWS Cognito.');
}

console.log('\n🚀 To set up AWS resources, run:');
console.log('   - PowerShell: .\\setup-aws.ps1');
console.log('   - Manual: Follow instructions in AWS_SETUP.md');

console.log('\n📊 After setup, check your users at:');
console.log('   AWS Console → Cognito → User pools → Your pool → Users');
