---
name: monitor-setup
description: "Set up monitoring and alerting: metrics, dashboards, health checks, and alert rules for applications."
source: community
allowed-tools: "*"
user-invocable: true
---

# Monitoring Setup

Set up comprehensive monitoring and alerting for an application or service.

## STEP 1: DEFINE MONITORING SCOPE

Parse $ARGUMENTS for:
- Application type (web app, API, worker, database, etc.)
- Infrastructure (cloud provider, Kubernetes, bare metal)
- Monitoring tools in use or preferred (Prometheus, Datadog, Grafana, CloudWatch, etc.)
- Current monitoring gaps

## STEP 2: DEFINE KEY METRICS

Identify the essential metrics to monitor:

### Application Metrics (RED Method)
- **Rate**: Requests per second, transactions per second
- **Errors**: Error rate, error types, 5xx vs 4xx
- **Duration**: Response time (p50, p95, p99)

### Resource Metrics (USE Method)
- **Utilization**: CPU, memory, disk, network
- **Saturation**: Queue depth, thread pool usage, connection pool
- **Errors**: Hardware errors, OOM kills, disk failures

### Business Metrics
- Active users, signups, conversions
- Feature usage, API endpoint usage
- Revenue-impacting metrics

## STEP 3: IMPLEMENT INSTRUMENTATION

Add monitoring code/configuration:

- Application-level metrics (request counters, histograms, gauges)
- Health check endpoints (liveness, readiness)
- Structured logging with correlation IDs
- Distributed tracing if applicable
- Custom metrics for business-critical paths

## STEP 4: CREATE DASHBOARDS

Design dashboards for:

- **Overview**: System health at a glance (green/yellow/red)
- **Performance**: Latency, throughput, error rates over time
- **Resources**: CPU, memory, disk, connections
- **Business**: Key business metrics and trends

## STEP 5: CONFIGURE ALERTS

Set up alert rules following best practices:

- Alert on symptoms, not causes (alert on high error rate, not high CPU)
- Set meaningful thresholds based on SLOs
- Include runbook links in alert descriptions
- Configure appropriate severity levels
- Avoid alert fatigue (no noisy alerts, group related alerts)
- Page for critical, ticket for warning

## STEP 6: OUTPUT

Provide:
- Configuration files for the monitoring stack
- Instrumentation code to add to the application
- Dashboard definitions (JSON/YAML)
- Alert rules with descriptions and runbook stubs
