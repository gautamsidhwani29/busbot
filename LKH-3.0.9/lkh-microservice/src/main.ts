// lkh-microservice/src/main.ts
import express from 'express';
import { config } from 'dotenv';
import { OptimizerEngine } from './engine';
import { RedisQueue } from './queue';
import { Logger } from './logger';

config();

const app = express();
const port = process.env.PORT || 3000;
const engine = new OptimizerEngine();
const queue = new RedisQueue();
const logger = new Logger();

app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', version: process.env.npm_package_version });
});

// Optimization Request Endpoint
app.post('/optimize', async (req, res) => {
  try {
    const jobId = await queue.enqueue({
      type: 'OPTIMIZATION_JOB',
      payload: req.body,
      createdAt: new Date()
    });

    res.status(202).json({
      jobId,
      statusUrl: `/jobs/${jobId}/status`
    });
  } catch (error) {
    logger.error('Optimization request failed', error);
    res.status(500).json({ error: 'Failed to queue optimization job' });
  }
});

// Job Status Endpoint
app.get('/jobs/:jobId/status', async (req, res) => {
  try {
    const job = await queue.getJob(req.params.jobId);
    res.json({
      status: job.status,
      progress: job.progress,
      resultUrl: job.completed ? `/jobs/${jobId}/result` : null
    });
  } catch (error) {
    res.status(404).json({ error: 'Job not found' });
  }
});

// Worker Processing
queue.processJobs(async (job) => {
  try {
    const result = await engine.optimize(job.payload);
    await queue.completeJob(job.id, result);
  } catch (error) {
    await queue.failJob(job.id, error);
    logger.error('Job processing failed', error);
  }
});

app.listen(port, () => {
  logger.info(`LKH Optimization Service running on port ${port}`);
});