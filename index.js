import express from 'express';
import { EventEmitter } from 'events';
import config from './config/index.js';
import database from './config/database.js';

class Application extends EventEmitter {
  constructor() {
    super();
    this.app = express();
    this.config = config;
    this.db = database.sequelize;
    
    // Setup basic middleware
    this.app.use(express.json());
    
    // Setup basic routes
    this.app.get('/', (req, res) => {
      res.send('Hello World!');
    });
  }
  
  // Proxy Express methods
  use(...args) {
    this.app.use(...args);
    return this;
  }
  
  get(path, ...handlers) {
    this.app.get(path, ...handlers);
    return this;
  }
  
  post(path, ...handlers) {
    this.app.post(path, ...handlers);
    return this;
  }
  
  // Add other HTTP methods as needed
  
  // Start the application
  async start() {
    try {
      // Emit 'before:start' event before initialization
      this.emit('before:start');
      
      // Test database connection before starting the server
      await this.db.authenticate();
      console.log('Database connection has been established successfully.');
      
      // Start the server
      const server = this.app.listen(this.config.port, () => {
        console.log(`Server is running on port ${this.config.port} in ${this.config.env} mode`);
        
        // Emit 'after:start' event once server is listening
        this.emit('after:start', server);
      });
      
      // Handle server errors
      server.on('error', (error) => {
        this.emit('error', error);
      });
      
      // Setup graceful shutdown
      process.on('SIGTERM', () => {
        this.emit('shutdown');
        server.close(async () => {
          console.log('HTTP server closed');
          await this.db.close();
          console.log('Database connection closed');
          process.exit(0);
        });
      });
      
      // Handle SIGINT (Ctrl+C)
      process.on('SIGINT', () => {
        this.emit('shutdown');
        server.close(async () => {
          console.log('HTTP server closed');
          await this.db.close();
          console.log('Database connection closed');
          process.exit(0);
        });
      });
      
      return server;
    } catch (error) {
      this.emit('error', error);
      console.error('Failed to start application:', error);
      process.exit(1);
    }
  }
}

// Create application instance
const app = new Application();

// Register event handlers
app.on('before:start', () => {
  console.log('Application is initializing...');
  console.log('Establishing database connection...');
});

app.on('after:start', (server) => {
  console.log('Application has started successfully');
});

app.on('error', (error) => {
  console.error('Application error:', error);
});

app.on('shutdown', () => {
  console.log('Application is shutting down...');
});

// Start the application
app.start().catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

export default app; // Export for testing or external use
