terraform {
  required_version = ">= 1.11.0, < 2.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  backend "s3" {
    # bucket は backend.hcl（Git管理外）で指定する: terraform init -backend-config=backend.hcl
    key          = "stage1/terraform.tfstate"
    region       = "ap-northeast-1"
    profile      = "taskmanagement-prod"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region  = var.region
  profile = var.profile

  default_tags {
    tags = {
      Project = var.project_name
      Stage   = "stage1"
    }
  }
}
