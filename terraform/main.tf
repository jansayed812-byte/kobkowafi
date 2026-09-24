terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.24"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# EKS Cluster
resource "aws_eks_cluster" "bruteforcer" {
  name     = var.cluster_name
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = "1.28"

  vpc_config {
    subnet_ids              = var.subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy
  ]

  tags = {
    Name        = var.cluster_name
    Environment = var.environment
  }
}

# EKS Node Group
resource "aws_eks_node_group" "bruteforcer" {
  cluster_name    = aws_eks_cluster.bruteforcer.name
  node_group_name = "${var.cluster_name}-node-group"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = var.subnet_ids
  version         = aws_eks_cluster.bruteforcer.version

  scaling_config {
    desired_size = var.node_desired_size
    max_size     = var.node_max_size
    min_size     = var.node_min_size
  }

  instance_types = [var.node_instance_type]

  depends_on = [
    aws_iam_role_policy_attachment.eks_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
  ]

  tags = {
    Environment = var.environment
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "bruteforcer" {
  identifier     = "bruteforcer-db"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class
  allocated_storage = var.db_allocated_storage

  db_name  = "bruteforcer"
  username = var.db_username
  password = var.db_password

  skip_final_snapshot = var.environment != "production"
  storage_encrypted   = true
  multi_az            = var.environment == "production"

  tags = {
    Environment = var.environment
  }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "bruteforcer" {
  cluster_id           = "bruteforcer-redis"
  engine               = "redis"
  node_type           = var.redis_node_type
  num_cache_nodes     = var.redis_num_nodes
  parameter_group_name = "default.redis7"
  port                = 6379

  tags = {
    Environment = var.environment
  }
}

# IAM Roles
resource "aws_iam_role" "eks_cluster_role" {
  name = "${var.cluster_name}-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster_role.name
}

resource "aws_iam_role" "eks_node_role" {
  name = "${var.cluster_name}-eks-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eks_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node_role.name
}

output "cluster_endpoint" {
  value = aws_eks_cluster.bruteforcer.endpoint
}

output "cluster_name" {
  value = aws_eks_cluster.bruteforcer.name
}

output "rds_endpoint" {
  value = aws_db_instance.bruteforcer.endpoint
}

output "redis_endpoint" {
  value = aws_elasticache_cluster.bruteforcer.cache_nodes[0].address
}
