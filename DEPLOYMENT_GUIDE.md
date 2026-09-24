# Brute Forcer Pro - Deployment Guide

## Overview

Complete deployment instructions for Brute Forcer Pro across multiple cloud platforms and on-premises environments.

---

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Kubernetes (EKS/GKE/AKS)](#kubernetes)
4. [AWS Deployment](#aws-deployment)
5. [Google Cloud Deployment](#google-cloud-deployment)
6. [Azure Deployment](#azure-deployment)
7. [DigitalOcean Deployment](#digitalocean-deployment)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Recovery](#backup--recovery)
10. [Security Hardening](#security-hardening)

---

## Local Development

### Prerequisites
```bash
Node.js 18+
Docker & Docker Compose
PostgreSQL 15
Redis 7
```

### Setup
```bash
# Clone repository
git clone https://github.com/jansayed812-byte/kobkowafi.git
cd kobkowafi

# Backend setup
cd backend
npm install
cp .env.example .env

# Database
docker-compose up -d postgres redis
npm run db:init

# Start backend
npm run dev
```

---

## Docker Deployment

### Single Container
```bash
cd backend
docker build -t bruteforcer:latest .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  bruteforcer:latest
```

### Docker Compose Stack
```bash
docker-compose up -d
```

Services:
- API (Node.js) - Port 3000
- PostgreSQL - Port 5432
- Redis - Port 6379
- Nginx (optional) - Port 80/443

---

## Kubernetes

### Prerequisites
- kubectl configured
- Helm 3.0+ (optional)
- Kubernetes cluster (1.24+)

### Deployment

#### 1. Create Namespace
```bash
kubectl create namespace bruteforcer
```

#### 2. Create Secrets
```bash
kubectl create secret generic bruteforcer-secrets \
  --from-literal=JWT_SECRET=$(openssl rand -base64 32) \
  --from-literal=JWT_REFRESH_SECRET=$(openssl rand -base64 32) \
  --from-literal=DB_PASSWORD=$(openssl rand -base64 16) \
  -n bruteforcer
```

#### 3. Deploy Database Services
```bash
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/configmap.yaml
```

#### 4. Deploy API
```bash
kubectl apply -f k8s/api-deployment.yaml
```

#### 5. Deploy Ingress
```bash
kubectl apply -f k8s/ingress.yaml
```

#### 6. Verify Deployment
```bash
kubectl get pods -n bruteforcer
kubectl get svc -n bruteforcer
kubectl logs -f deployment/bruteforcer-api -n bruteforcer
```

---

## AWS Deployment

### Option 1: EKS (Kubernetes)

#### Prerequisites
- AWS CLI configured
- Terraform (optional)
- IAM permissions

#### Using Terraform
```bash
cd terraform

# Initialize
terraform init

# Plan
terraform plan -var-file=prod.tfvars

# Apply
terraform apply -var-file=prod.tfvars
```

#### Manual Setup
```bash
# Create EKS cluster
aws eks create-cluster \
  --name bruteforcer \
  --version 1.28 \
  --role-arn arn:aws:iam::ACCOUNT:role/eks-service-role \
  --resources-vpc-config subnetIds=subnet-1,subnet-2

# Get credentials
aws eks update-kubeconfig --name bruteforcer

# Deploy applications
kubectl apply -f k8s/
```

### Option 2: Elastic Beanstalk

```bash
# Initialize
eb init -p node.js-18

# Create environment
eb create bruteforcer-prod

# Deploy
git push origin main  # Triggers automatic deployment
```

### Option 3: ECS Fargate

```bash
# Create cluster
aws ecs create-cluster --cluster-name bruteforcer

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster bruteforcer \
  --service-name bruteforcer-api \
  --task-definition bruteforcer:1 \
  --desired-count 3
```

---

## Google Cloud Deployment

### Option 1: GKE (Kubernetes)

```bash
# Create cluster
gcloud container clusters create bruteforcer \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-2

# Get credentials
gcloud container clusters get-credentials bruteforcer

# Deploy
kubectl apply -f k8s/
```

### Option 2: Cloud Run

```bash
# Build image
gcloud builds submit --tag gcr.io/PROJECT/bruteforcer

# Deploy
gcloud run deploy bruteforcer \
  --image gcr.io/PROJECT/bruteforcer \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=... \
  --allow-unauthenticated
```

---

## Azure Deployment

### Option 1: AKS (Kubernetes)

```bash
# Create resource group
az group create --name bruteforcer --location eastus

# Create AKS cluster
az aks create \
  --resource-group bruteforcer \
  --name bruteforcer-aks \
  --node-count 3 \
  --vm-set-type VirtualMachineScaleSets

# Get credentials
az aks get-credentials \
  --resource-group bruteforcer \
  --name bruteforcer-aks

# Deploy
kubectl apply -f k8s/
```

### Option 2: App Service

```bash
# Create app service plan
az appservice plan create \
  --name bruteforcer-plan \
  --resource-group bruteforcer \
  --sku B2 --is-linux

# Create web app
az webapp create \
  --resource-group bruteforcer \
  --plan bruteforcer-plan \
  --name bruteforcer-api \
  --runtime "node|18"
```

---

## DigitalOcean Deployment

### Option 1: DOKS (Kubernetes)

```bash
# Create cluster
doctl kubernetes cluster create bruteforcer \
  --region nyc3 \
  --count 3 \
  --machine-slug s-2vcpu-4gb

# Get kubeconfig
doctl kubernetes cluster kubeconfig save bruteforcer

# Deploy
kubectl apply -f k8s/
```

### Option 2: App Platform

```bash
# Create app.yaml
cat > app.yaml <<EOF
name: bruteforcer
services:
- github:
    repo: jansayed812-byte/kobkowafi
    branch: main
  name: api
  http_port: 3000
EOF

# Deploy
doctl apps create --spec app.yaml
```

---

## CI/CD Pipeline

### GitHub Actions (Included)

The `.github/workflows/ci-cd.yml` file includes:

1. **Backend Tests**
   - TypeScript type checking
   - Unit tests
   - Lint checks

2. **Android Build**
   - Gradle build
   - Unit tests

3. **Docker Build**
   - Image build and push
   - Registry: ghcr.io

4. **Security Scan**
   - Vulnerability scanning
   - Dependency audit

5. **Deployment**
   - Staging on develop branch
   - Production on main branch

---

## Monitoring & Logging

### Prometheus

```yaml
# prometheus-config.yaml
global:
  scrape_interval: 15s

scrape_configs:
- job_name: 'bruteforcer-api'
  static_configs:
  - targets: ['localhost:3000']
```

### Grafana

Create dashboards for:
- Request rate
- Response time
- Error rate
- Database connections
- Redis memory usage

### ELK Stack

```bash
# Docker Compose with ELK
docker-compose -f docker-compose.elk.yml up -d
```

### Cloud Logging

**AWS CloudWatch**
```bash
aws logs create-log-group --log-group-name /bruteforcer/api
aws logs create-log-stream \
  --log-group-name /bruteforcer/api \
  --log-stream-name prod
```

**Google Cloud Logging**
```bash
gcloud logging write bruteforcer-api "message" --severity=INFO
```

---

## Backup & Recovery

### Database Backups

**PostgreSQL**
```bash
# Full backup
pg_dump -U bruteforcer -h localhost bruteforcer > backup.sql

# Point-in-time recovery
pg_restore backup.sql
```

**Automated Backups**
```bash
# AWS RDS
aws rds create-db-snapshot \
  --db-instance-identifier bruteforcer-db \
  --db-snapshot-identifier bruteforcer-backup-$(date +%Y%m%d)
```

### Disaster Recovery

**Kubernetes**
```bash
# Velero backup
velero backup create bruteforcer-backup --include-namespaces bruteforcer

# Restore
velero restore create --from-backup bruteforcer-backup
```

---

## Security Hardening

### Network Security

1. **SSL/TLS**
```bash
# Let's Encrypt with cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

2. **Network Policies**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: bruteforcer-netpol
spec:
  podSelector:
    matchLabels:
      app: bruteforcer-api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
```

3. **WAF Rules**
```bash
# AWS WAF
aws wafv2 create-web-acl \
  --name bruteforcer-waf \
  --scope REGIONAL \
  --default-action Block={} \
  --rules file://rules.json
```

### Pod Security

```yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: bruteforcer-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
  - ALL
  volumes:
  - 'configMap'
  - 'emptyDir'
  - 'projected'
  - 'secret'
  - 'downwardAPI'
  - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  fsGroup:
    rule: 'RunAsAny'
```

### Secret Management

**AWS Secrets Manager**
```bash
aws secretsmanager create-secret \
  --name bruteforcer/prod/jwt \
  --secret-string $(openssl rand -base64 32)
```

**Kubernetes Sealed Secrets**
```bash
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml
```

---

## Troubleshooting

### Common Issues

**Pod won't start**
```bash
kubectl describe pod <pod-name> -n bruteforcer
kubectl logs <pod-name> -n bruteforcer
```

**Database connection errors**
```bash
kubectl exec -it postgres-0 -n bruteforcer -- psql -U bruteforcer
\l  # List databases
\dt  # List tables
```

**High memory usage**
```bash
kubectl top pod -n bruteforcer
kubectl logs -f deployment/bruteforcer-api -n bruteforcer | grep -i memory
```

---

## Performance Tuning

### Database
- Enable query caching
- Add indexes for frequently queried columns
- Implement connection pooling
- Set up read replicas

### Application
- Enable gzip compression
- Implement caching headers
- Use CDN for static assets
- Optimize image sizes

### Infrastructure
- Set appropriate resource limits
- Use node autoscaling
- Implement rate limiting
- Deploy multiple replicas

---

## Rollback Procedures

```bash
# Kubernetes rollback
kubectl rollout history deployment/bruteforcer-api -n bruteforcer
kubectl rollout undo deployment/bruteforcer-api -n bruteforcer

# Docker rollback
docker pull bruteforcer:previous-version
docker-compose up -d
```

---

## Cost Optimization

- Use spot instances for non-critical workloads
- Implement auto-scaling based on metrics
- Use reserved instances for baseline load
- Clean up unused resources regularly
- Use multi-region replication for critical data

---

## Support

For deployment issues:
1. Check logs: `kubectl logs -f <pod> -n bruteforcer`
2. Review events: `kubectl get events -n bruteforcer`
3. Contact: jansayed812@gmail.com

---

**Last Updated**: 2026-09-24  
**Version**: 1.0.0
