// src/monitoring.ts
export class MetricsCollector {
    private static instance: MetricsCollector;
    private metrics: Map<string, number> = new Map();
  
    trackRequest() {
      this.metrics.set('requests.total', (this.metrics.get('requests.total') || 0) + 1);
    }
  
    trackSuccess() {
      this.metrics.set('requests.success', (this.metrics.get('requests.success') || 0) + 1);
    }
  
    trackFailure() {
      this.metrics.set('requests.failed', (this.metrics.get('requests.failed') || 0) + 1);
    }
  
    getMetrics() {
      return Object.fromEntries(this.metrics.entries());
    }
  }