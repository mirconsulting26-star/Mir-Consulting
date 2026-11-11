---
name: terraform
description: "Write Terraform infrastructure-as-code: modules, state management, variables, outputs, and workspace-based environment separation."
user-invocable: true
disable-model-invocation: false
model: sonnet
source: hashicorp
allowed-tools: Read, Write, Bash, Glob
---

# Terraform Infrastructure-as-Code

Writes production-grade Terraform configurations for cloud infrastructure, following HashiCorp best practices.

## STEP 1: UNDERSTAND THE INFRASTRUCTURE

Parse $ARGUMENTS for:
- Cloud provider: AWS, GCP, Azure, or multi-cloud
- Resources needed: compute, database, storage, networking, DNS, CDN
- Environments: dev, staging, production (use workspaces or separate state)

## STEP 2: PROJECT STRUCTURE

Organize Terraform code as:
```
infrastructure/
  modules/
    vpc/
    database/
    app-service/
  environments/
    dev/
      main.tf
      variables.tf
      outputs.tf
      terraform.tfvars
    prod/
      main.tf
      ...
  main.tf      # Root module (if single env)
  variables.tf
  outputs.tf
  versions.tf
```

## STEP 3: WRITE versions.tf

Always pin provider and Terraform versions:
```hcl
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "my-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
    encrypt = true
    dynamodb_table = "terraform-lock"
  }
}
```

## STEP 4: WRITE MODULES

Each reusable resource group becomes a module with:
- `main.tf` — resource definitions
- `variables.tf` — all input variables with descriptions and types
- `outputs.tf` — all outputs needed by other modules

Variable discipline:
- Every variable has a `description`
- Sensitive values use `sensitive = true`
- Use `type` constraints: `string`, `number`, `bool`, `list(string)`, `map(string)`
- Use `default = null` for optional variables, not empty string

## STEP 5: STATE MANAGEMENT

Remote state configuration:
- State stored in S3 (AWS) or GCS (GCP) — never locally
- State locking with DynamoDB (AWS) or GCS object locking
- Separate state files per environment — never share state between prod and dev

## STEP 6: SECURITY BASELINE

- IAM roles follow least privilege — no `*` actions unless explicitly justified
- No secrets in Terraform code or `.tfvars` files — use AWS Secrets Manager, SSM Parameter Store, or Vault
- Security groups are explicit (no `0.0.0.0/0` ingress except for 80/443 on load balancers)
- All resources are tagged with `environment`, `project`, `managed-by = terraform`

## STEP 7: VERIFY

Run:
```bash
terraform init
terraform validate
terraform plan -var-file=terraform.tfvars
```

Review the plan output before applying. Flag any destructive operations for explicit approval.

## ANTI-PATTERNS

- `terraform apply` without reviewing `terraform plan` first
- Hardcoded AMI IDs, region strings, or account IDs — use data sources
- No remote state — local state is lost and not shareable
- Resources defined without tags (impossible to audit costs or ownership)
- `count` for conditional resources — use `for_each` with `toset()` instead
- Secrets in `terraform.tfvars` committed to git
