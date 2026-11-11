---
name: data-pipeline
description: "Design and implement data pipelines: ETL/ELT flows, data transformations, scheduling, and error handling."
source: community
allowed-tools: "*"
user-invocable: true
---

# Data Pipeline Builder

Design and implement data pipelines for extracting, transforming, and loading data between systems.

## STEP 1: DEFINE PIPELINE REQUIREMENTS

Parse $ARGUMENTS for:
- **Source(s)**: Where data comes from (API, database, files, streams)
- **Destination**: Where data goes (data warehouse, database, files, API)
- **Transformations**: What needs to happen to the data
- **Schedule**: How often (real-time, hourly, daily, on-demand)
- **Volume**: Expected data size and growth rate
- **SLA**: Acceptable latency and error tolerance

## STEP 2: DESIGN THE PIPELINE

Choose the appropriate pattern:

### ETL (Extract-Transform-Load)
- Transform in the pipeline before loading
- Best for: clean data before storage, schema enforcement, data quality

### ELT (Extract-Load-Transform)
- Load raw data, transform in the destination
- Best for: data warehouses with powerful query engines, schema-on-read

### Streaming
- Process data as it arrives
- Best for: real-time requirements, event-driven systems

Design the pipeline stages:
1. **Extract**: Connection to source, pagination, incremental reads
2. **Validate**: Schema validation, data quality checks
3. **Transform**: Cleaning, mapping, aggregation, enrichment
4. **Load**: Upsert strategy, batch size, error handling
5. **Monitor**: Row counts, latency, error rates

## STEP 3: IMPLEMENT

Build each pipeline stage:

### Extraction
- Implement connection with retry logic and backoff
- Handle pagination and rate limiting
- Support incremental extraction (watermark, CDC, timestamps)
- Log extraction metrics (rows, bytes, duration)

### Transformation
- Apply data type conversions
- Handle null/missing values
- Implement business logic transformations
- Validate output schema

### Loading
- Choose upsert strategy (merge, replace, append)
- Implement batching for large datasets
- Handle conflicts and duplicates
- Verify row counts after load

### Error Handling
- Dead letter queue for failed records
- Retry with exponential backoff for transient errors
- Alert on persistent failures
- Maintain idempotency (re-runnable without duplicates)

## STEP 4: ADD ORCHESTRATION

Set up scheduling and monitoring:
- Cron schedule or event triggers
- Dependency management (pipeline B waits for pipeline A)
- Alerting on failures or SLA breaches
- Dashboard for pipeline health

## STEP 5: TEST

Verify the pipeline:
- Run with sample data and validate output
- Test error scenarios (source unavailable, malformed data, destination full)
- Test idempotency (run twice, verify no duplicates)
- Measure performance against SLA requirements
