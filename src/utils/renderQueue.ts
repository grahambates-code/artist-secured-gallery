
class RenderQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        await task();
        // Small delay to ensure canvas cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    this.isProcessing = false;
  }
}

export const renderQueue = new RenderQueue();
