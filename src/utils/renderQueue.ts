
class RenderQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;

  async add<T>(task: () => Promise<T>): Promise<T> {
    console.log('Adding task to render queue, current queue length:', this.queue.length);
    
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          console.log('Executing queued task...');
          const result = await task();
          console.log('Task completed successfully');
          resolve(result);
        } catch (error) {
          console.error('Task failed:', error);
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing) {
      console.log('Queue already being processed');
      return;
    }
    
    if (this.queue.length === 0) {
      console.log('Queue is empty');
      return;
    }

    console.log('Starting queue processing, queue length:', this.queue.length);
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        console.log('Processing next task...');
        await task();
        // Small delay to ensure canvas cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('Queue processing completed');
    this.isProcessing = false;
  }
}

export const renderQueue = new RenderQueue();
