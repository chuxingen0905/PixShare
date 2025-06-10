# PixShare AWS Setup Script
# This script helps set up AWS Amplify for PixShare

Write-Host "🚀 PixShare AWS Setup Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if Amplify CLI is installed
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

try {
    $amplifyVersion = amplify --version
    Write-Host "✅ Amplify CLI found: $amplifyVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Amplify CLI not found. Installing..." -ForegroundColor Red
    npm install -g @aws-amplify/cli
}

# Check if AWS CLI is installed
try {
    $awsVersion = aws --version
    Write-Host "✅ AWS CLI found" -ForegroundColor Green
} catch {
    Write-Host "⚠️  AWS CLI not found. Please install AWS CLI first." -ForegroundColor Yellow
    Write-Host "   Download from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Setting up Amplify..." -ForegroundColor Yellow

# Ask user if they want to proceed
$proceed = Read-Host "Do you want to initialize Amplify? (y/n)"

if ($proceed -eq "y" -or $proceed -eq "Y") {
    Write-Host "🚀 Initializing Amplify..." -ForegroundColor Green
    
    # Initialize Amplify
    amplify init --quickstart --frontend javascript --framework vue --srcDir src --distDir dist --buildCommand "npm run build" --startCommand "npm run dev"
    
    Write-Host ""
    Write-Host "👤 Adding Authentication..." -ForegroundColor Green
    amplify add auth --defaults
    
    Write-Host ""
    Write-Host "🗄️  Adding API (GraphQL)..." -ForegroundColor Green
    # This will require manual intervention for schema
    Write-Host "⚠️  You'll need to manually configure the API schema." -ForegroundColor Yellow
    Write-Host "   Use the schema provided in AWS_SETUP.md" -ForegroundColor Yellow
    
    $addApi = Read-Host "Add API now? (y/n)"
    if ($addApi -eq "y" -or $addApi -eq "Y") {
        amplify add api
    }
    
    Write-Host ""
    Write-Host "📦 Adding Storage (S3)..." -ForegroundColor Green
    $addStorage = Read-Host "Add Storage now? (y/n)"
    if ($addStorage -eq "y" -or $addStorage -eq "Y") {
        amplify add storage
    }
    
    Write-Host ""
    Write-Host "🚀 Ready to deploy!" -ForegroundColor Green
    Write-Host "Run 'amplify push' to deploy your backend to AWS" -ForegroundColor Yellow
    
    $deploy = Read-Host "Deploy now? (y/n)"
    if ($deploy -eq "y" -or $deploy -eq "Y") {
        Write-Host "🚀 Deploying to AWS..." -ForegroundColor Green
        amplify push
        
        Write-Host ""
        Write-Host "✅ Setup complete!" -ForegroundColor Green
        Write-Host "Check your AWS Console to see the created resources:" -ForegroundColor Yellow
        Write-Host "- Cognito User Pool for authentication" -ForegroundColor White
        Write-Host "- AppSync API for GraphQL" -ForegroundColor White
        Write-Host "- DynamoDB tables for data" -ForegroundColor White
        Write-Host "- S3 bucket for photo storage" -ForegroundColor White
        
        Write-Host ""
        Write-Host "🎉 You can now register users and see them in AWS Cognito!" -ForegroundColor Green
    }
} else {
    Write-Host "Setup cancelled. Run this script again when ready." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📚 For manual setup instructions, see AWS_SETUP.md" -ForegroundColor Cyan
