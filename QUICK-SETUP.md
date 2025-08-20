# 🚀 Quick AWS Cognito Setup

## Prerequisites Check:
```bash
# Check AWS CLI is configured
aws sts get-caller-identity

# Should show your AWS account info
```

## Deploy Infrastructure:
```bash
# 1. Initialize Terraform
cd terraform
terraform init

# 2. See what will be created
terraform plan

# 3. Create the infrastructure (type 'yes' when prompted)
terraform apply

# 4. Update your .env file automatically
cd ..
./scripts/update-env-from-terraform.sh
```

## Verify Setup:
```bash
# Check your .env file was created
cat .env

# Restart Expo to pick up new environment variables
# Press Ctrl+C in the Expo terminal, then:
npm start
```

## If Something Goes Wrong:
```bash
# Check Terraform state
cd terraform
terraform show

# Destroy everything and start over
terraform destroy
```

## Cost Monitoring:
- Visit AWS Console > Cognito > User Pools
- Check "Metrics" tab for MAU count
- Set up billing alerts in AWS Console

## What You'll See:
- User Pool: `cognito-rn-poc-dev-user-pool`
- Client: `cognito-rn-poc-dev-client`  
- Identity Pool: `cognito-rn-poc-dev-identity-pool`
