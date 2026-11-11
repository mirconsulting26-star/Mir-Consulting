---
name: k8s-manifest
description: "Generate Kubernetes manifests: deployments, services, ingress, configmaps, and secrets with best practices."
source: community
allowed-tools: "*"
user-invocable: true
---

# Kubernetes Manifest Generator

Generate production-ready Kubernetes manifests following best practices for security, reliability, and maintainability.

## STEP 1: UNDERSTAND THE APPLICATION

Parse $ARGUMENTS for:
- Application name and type (web server, worker, cron job, etc.)
- Container image and tag
- Port(s) to expose
- Environment variables and secrets needed
- Resource requirements (CPU, memory)
- Scaling requirements (min/max replicas)
- Storage needs (persistent volumes)
- Dependencies (databases, caches, message queues)

## STEP 2: GENERATE MANIFESTS

Create the following resources as needed:

### Deployment / StatefulSet
- Container spec with image, ports, env vars
- Resource requests AND limits
- Liveness and readiness probes
- Security context (non-root, read-only filesystem)
- Pod anti-affinity for high availability
- Graceful shutdown (preStop hook, terminationGracePeriodSeconds)

### Service
- ClusterIP for internal services
- LoadBalancer or NodePort for external access
- Proper port naming and protocol

### Ingress
- TLS configuration
- Path-based or host-based routing
- Rate limiting and CORS annotations if needed

### ConfigMap / Secret
- Non-sensitive configuration in ConfigMaps
- Sensitive values in Secrets (with notes about using external secret managers)
- Mounted as env vars or volumes as appropriate

### HPA (Horizontal Pod Autoscaler)
- CPU and memory-based scaling
- Custom metrics if applicable
- Appropriate min/max boundaries

### NetworkPolicy
- Restrict ingress and egress to only required connections
- Default deny with explicit allows

## STEP 3: VALIDATE

Check manifests for:
- No hardcoded secrets in manifests
- Resource limits set on all containers
- Health checks configured
- Security context applied
- Labels and annotations consistent
- Namespace specified

## STEP 4: OUTPUT

Present manifests organized by resource type, with comments explaining non-obvious configuration choices.
