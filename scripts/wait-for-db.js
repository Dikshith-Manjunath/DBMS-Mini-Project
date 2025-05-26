const { Pool } = require('pg');
const { exec } = require('child_process');

// Get configuration from environment variables
const config = {
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '0605',
  host: process.env.POSTGRES_HOST || 'db',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DATABASE || 'dbms_mini_2',
};

console.log('Waiting for database to be ready...');
console.log(`Host: ${config.host}, Database: ${config.database}`);

// Maximum number of connection attempts
const maxAttempts = 30;
// Delay between attempts in milliseconds
const delay = 2000;

let attempts = 0;
let connected = false;

// Function to attempt database connection
const attemptConnection = () => {
  attempts++;
  
  const pool = new Pool({
    ...config,
    // Set a short connection timeout
    connectionTimeoutMillis: 5000
  });

  console.log(`Connection attempt ${attempts}/${maxAttempts}...`);
  
  // Test connection
  pool.query('SELECT 1')
    .then(() => {
      console.log('✅ Successfully connected to database!');
      connected = true;
      pool.end();
      
      // Continue with the build process
      console.log('Starting build process...');
      const buildProcess = exec('npm run build', (error, stdout, stderr) => {
        if (error) {
          console.error(`Build error: ${error.message}`);
          process.exit(1);
        }
        if (stderr) {
          console.error(`Build stderr: ${stderr}`);
        }
        console.log(`Build output: ${stdout}`);
      });
      
      buildProcess.stdout.on('data', (data) => {
        console.log(data);
      });
    })
    .catch(err => {
      console.error(`Failed to connect: ${err.message}`);
      pool.end();
      
      // If we've reached max attempts, exit with error
      if (attempts >= maxAttempts) {
        console.error('Maximum connection attempts reached. Exiting...');
        process.exit(1);
      }
      
      // Otherwise, try again after delay
      console.log(`Retrying in ${delay/1000} seconds...`);
      setTimeout(attemptConnection, delay);
    });
};

// Start the connection attempt process
attemptConnection();