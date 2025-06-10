# AWS Setup Guide for PixShare

This guide will help you set up the AWS resources needed for your PixShare application.

## Prerequisites
- AWS CLI installed and configured
- Node.js and npm installed
- Amplify CLI installed (`npm install -g @aws-amplify/cli`)

## Step 1: Install Amplify CLI (if not already installed)
```bash
npm install -g @aws-amplify/cli
```

## Step 2: Configure Amplify CLI
```bash
amplify configure
```
This will:
- Open AWS console in browser
- Ask you to create an IAM user
- Configure local AWS credentials

## Step 3: Initialize Amplify in your project
```bash
cd /d/pixshare/PixShare
amplify init
```

When prompted:
- Project name: `pixshare`
- Environment name: `dev`
- Default editor: `Visual Studio Code`
- App type: `javascript`
- Framework: `vue`
- Source Directory Path: `src`
- Distribution Directory Path: `dist`
- Build Command: `npm run build`
- Start Command: `npm run dev`

## Step 4: Add Authentication (Cognito)
```bash
amplify add auth
```

Choose these options:
- Configuration: `Default configuration`
- Sign-in method: `Email`
- Advanced settings: `No, I am done.`

## Step 5: Add API (AppSync + DynamoDB)
```bash
amplify add api
```

Choose these options:
- Service: `GraphQL`
- API name: `pixshareapi`
- Authorization type: `Amazon Cognito User Pool`
- Additional authorization types: `No`
- Conflict resolution strategy: `Auto Merge`
- Guided schema creation: `Yes`
- Template: `Single object with fields`
- Edit schema now: `Yes`

Replace the generated schema with this:

```graphql
type User @model @auth(rules: [{allow: owner}]) {
  id: ID!
  email: String! @index(name: "byEmail")
  name: String
  avatar: String
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type Photo @model @auth(rules: [{allow: owner}, {allow: private, operations: [read]}]) {
  id: ID!
  name: String!
  key: String!
  size: Int
  type: String
  description: String
  tags: [String]
  isPublic: Boolean
  sharedWith: [String]
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
  owner: String
}

type SharedLink @model @auth(rules: [{allow: owner}]) {
  id: ID!
  photoId: ID!
  token: String!
  permissions: [String]
  expiresAt: AWSDateTime
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}
```

## Step 6: Add Storage (S3)
```bash
amplify add storage
```

Choose these options:
- Service: `Content (Images, audio, video, etc.)`
- Resource name: `pixsharestorage`
- Bucket name: (accept default)
- Access: `Auth users only`
- Access for authenticated users: `create/update, read, delete`

## Step 7: Deploy to AWS
```bash
amplify push
```

This will:
- Create all AWS resources
- Generate the aws-exports.js file with real values
- Deploy your backend

## Step 8: Update your aws-exports.js
After `amplify push` completes, replace your current `src/aws-exports.js` with the generated one.

## Step 9: Test your application
```bash
npm run dev
```

## Viewing Users in AWS Console

1. Go to AWS Console
2. Navigate to Amazon Cognito
3. Click on "User pools"
4. Select your PixShare user pool
5. Go to "Users" tab to see registered users

## Useful Commands

- `amplify status` - Check current status
- `amplify console` - Open Amplify console
- `amplify env list` - List environments
- `amplify push` - Deploy changes
- `amplify pull` - Pull latest backend changes

## Troubleshooting

If you encounter issues:
1. Check AWS credentials: `aws configure list`
2. Check Amplify status: `amplify status`
3. View logs: `amplify console`
4. Reset if needed: `amplify delete` (⚠️ This deletes everything!)

## Environment Variables

After setup, you can optionally use environment variables by creating `.env.local`:

```env
VITE_AWS_PROJECT_REGION=us-east-1
VITE_AWS_COGNITO_REGION=us-east-1
VITE_AWS_USER_POOLS_ID=your-user-pool-id
VITE_AWS_USER_POOLS_WEB_CLIENT_ID=your-app-client-id
VITE_AWS_APPSYNC_GRAPHQL_ENDPOINT=your-appsync-endpoint
VITE_AWS_USER_FILES_S3_BUCKET=your-s3-bucket-name
```

Then update aws-exports.js to use these if needed.
