# Outputs for the React Native app
output "user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = aws_cognito_user_pool_client.main.id
}

output "identity_pool_id" {
  description = "Cognito Identity Pool ID"
  value       = aws_cognito_identity_pool.main.id
}

output "aws_region" {
  description = "AWS Region"
  value       = var.aws_region
}

output "user_pool_endpoint" {
  description = "Cognito User Pool Endpoint"
  value       = aws_cognito_user_pool.main.endpoint
}

# Output in a format ready for .env file
output "env_variables" {
  description = "Environment variables for the React Native app"
  value = {
    EXPO_PUBLIC_USER_POOL_ID        = aws_cognito_user_pool.main.id
    EXPO_PUBLIC_USER_POOL_CLIENT_ID = aws_cognito_user_pool_client.main.id
    EXPO_PUBLIC_IDENTITY_POOL_ID    = aws_cognito_identity_pool.main.id
    EXPO_PUBLIC_AWS_REGION          = var.aws_region
  }
}
