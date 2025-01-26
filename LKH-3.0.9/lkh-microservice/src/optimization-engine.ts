import { exec } from 'child_process';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, unlink } from 'fs/promises';

const execAsync = promisify(exec);

export class OptimizationEngine {
  async runLKH(vrpContent: string, parContent: string) {
    const tempDir = tmpdir();
    const vrpPath = join(tempDir, `problem_${Date.now()}.vrp`);
    const parPath = join(tempDir, `params_${Date.now()}.par`);
    
    try {
      await Promise.all([
        writeFile(vrpPath, vrpContent),
        writeFile(parPath, parContent)
      ]);

      const { stdout } = await execAsync(
        `${process.env.LKH_BINARY_PATH} ${parPath}`,
        { timeout: 300000 }
      );

      return this.parseLKHOutput(stdout);
    } finally {
      await Promise.allSettled([
        unlink(vrpPath),
        unlink(parPath)
      ]);
    }
  }

  private parseLKHOutput(output: string) {
    const tourSection = output.split('TOUR_SECTION\n')[1];
    const nodes = tourSection
      .split('\n')
      .map(line => parseInt(line.trim()))
      .filter(num => !isNaN(num) && num !== -1);

    return {
      totalDistance: this.extractMetric(output, 'Cost'),
      computationTime: this.extractMetric(output, 'Time'),
      optimal: output.includes('OPTIMAL SOLUTION FOUND'),
      tour: nodes
    };
  }

  private extractMetric(output: string, metric: string) {
    const regex = new RegExp(`${metric}\\s*:\\s*([\\d.]+)`);
    const match = output.match(regex);
    return match ? parseFloat(match[1]) : null;
  }
}