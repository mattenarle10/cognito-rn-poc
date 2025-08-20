#!/bin/bash

# Script to update .env file from Terraform outputs
# Run this after terraform apply

echo "🚀 Updating .env file from Terraform outputs..."

cd terraform

# Check if terraform state exists
if [ ! -f "terraform.tfstate" ]; then
    echo "❌ No terraform.tfstate found. Please run 'terraform apply' first."
    exit 1
fi

# Get outputs from terraform
USER_POOL_ID=$(terraform output -raw user_pool_id)
USER_POOL_CLIENT_ID=$(terraform output -raw user_pool_client_id)
IDENTITY_POOL_ID=$(terraform output -raw identity_pool_id)
AWS_REGION=$(terraform output -raw aws_region)

cd ..

# Create .env file
cat > .env << EOF
# AWS Cognito Configuration (Auto-generated from Terraform)
# Last updated: $(date)

EXPO_PUBLIC_USER_POOL_ID=${USER_POOL_ID}
EXPO_PUBLIC_USER_POOL_CLIENT_ID=${USER_POOL_CLIENT_ID}
EXPO_PUBLIC_IDENTITY_POOL_ID=${IDENTITY_POOL_ID}
EXPO_PUBLIC_AWS_REGION=${AWS_REGION}

# Environment
NODE_ENV=development
EOF

echo "✅ .env file updated successfully!"
echo ""
echo "📋 Current configuration:"
echo "   User Pool ID: ${USER_POOL_ID}"
echo "   Client ID: ${USER_POOL_CLIENT_ID}"
echo "   Identity Pool ID: ${IDENTITY_POOL_ID}"
echo "   Region: ${AWS_REGION}"
