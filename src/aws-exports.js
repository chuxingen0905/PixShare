// AWS Amplify Configuration
// You'll need to replace these values with your actual AWS resources

const awsconfig = {    aws_project_region: 'ap-southeast-5', // Asia Pacific (Malaysia)
    aws_cognito_region: 'ap-southeast-5',
    aws_user_pools_id: 'ap-southeast-5_tnAOL4z5r', // Your Malaysia region User Pool ID
    aws_user_pools_web_client_id: '7sg54paubadlhv9t0vktaqtlr9', // Replace with your App Client ID
    oauth: {},
    aws_cognito_username_attributes: [],
    aws_cognito_social_providers: [],
    aws_cognito_signup_attributes: ['EMAIL'],
    aws_cognito_mfa_configuration: 'OFF',
    aws_cognito_mfa_types: ['SMS'],
    aws_cognito_password_protection_settings: {
        passwordPolicyMinLength: 8,
        passwordPolicyCharacters: [
            'REQUIRES_LOWERCASE',
            'REQUIRES_UPPERCASE',
            'REQUIRES_NUMBERS',
            'REQUIRES_SYMBOLS'
        ]
    },
    aws_cognito_verification_mechanisms: [],
    aws_appsync_graphqlEndpoint: 'https://XXXXXXXXXXXXXXXXXXXXXXXXXX.appsync-api.us-east-1.amazonaws.com/graphql', // Replace with your AppSync endpoint
    aws_appsync_region: 'us-east-1',
    aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
    aws_user_files_s3_bucket: 'pixwebsite ', // Replace with your S3 bucket name
    aws_user_files_s3_bucket_region: 'us-east-1',
    aws_cognito_identity_pool_id: 'ap-southeast-5:8a0d9d1f-d196-4c62-889d-a723ca587f35', // <-- Add your Identity Pool ID here
};

export default awsconfig;

