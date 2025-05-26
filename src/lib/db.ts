import { Pool } from 'pg';

// Create the pool configuration with detailed logging and fallbacks
const poolConfig = {
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '0605',
  host: process.env.POSTGRES_HOST || 'db',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DATABASE || 'dbms_mini_2',
};

console.log('Connecting to PostgreSQL with configuration:', {
  user: poolConfig.user,
  host: poolConfig.host,
  port: poolConfig.port,
  database: poolConfig.database,
});

// Initialize pool outside the retry logic
let pool = new Pool(poolConfig);

// Function to create connection with retry logic
const createConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connection established successfully');
    return true;
  } catch (err: any) {
    console.error('Database connection error:', err.message);
    pool = new Pool(poolConfig);
    throw err;
  }
};

// Implement retry logic
let retries = 5;
(async () => {
  while (retries) {
    try {
      await createConnection();
      break;
    } catch (err) {
      retries -= 1;
      console.log(`retries left: ${retries}`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  if (retries <= 0) {
    console.error('Failed to connect to database after multiple retries');
  }
})();

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;