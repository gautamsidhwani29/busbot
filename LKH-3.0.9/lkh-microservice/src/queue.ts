import IORedis from 'ioredis';

interface Job<T = any> {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  data: T;
  result?: any;
  error?: string;
}

export class RedisQueue {
  private client: IORedis.Redis;
  private pubSub: IORedis.Redis;

  constructor() {
    this.client = new IORedis(process.env.REDIS_URL!);
    this.pubSub = new IORedis(process.env.REDIS_URL!);
  }

  async enqueue<T>(data: T): Promise<string> {
    const jobId = `job:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    await this.client.hset(
      'jobs',
      jobId,
      JSON.stringify({
        id: jobId,
        status: 'queued',
        progress: 0,
        data
      })
    );
    return jobId;
  }

  async processJobs(handler: (job: Job) => Promise<void>) {
    this.pubSub.subscribe('jobs', (err) => {
      if (err) throw err;
    });

    this.pubSub.on('message', async (channel, message) => {
      if (channel === 'jobs') {
        const job = JSON.parse(message) as Job;
        await this.updateJobStatus(job.id, 'processing');
        try {
          await handler(job);
          await this.completeJob(job.id, job.result);
        } catch (error) {
          await this.failJob(job.id, error instanceof Error ? error.message : 'Unknown error');
        }
      }
    });
  }

  // Additional queue methods...
}