const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getProjectRoot() {
  return path.resolve(__dirname, '..');
}

function migrate() {
  const projectRoot = getProjectRoot();
  const envPath = path.resolve(projectRoot, '.env.local');

  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found! Please create it first.');
    process.exit(1);
  }

  // Manually read the .env.local file
  const envConfig = fs.readFileSync(envPath, 'utf8');
  const dbUrlLine = envConfig.split(/\r?\n/).find(line => line.trim().startsWith('DATABASE_URL='));
  
  if (!dbUrlLine) {
    console.error('❌ DATABASE_URL not found in .env.local! Please check the file content and format.');
    process.exit(1);
  }

  const dbUrl = dbUrlLine.split('=')[1].replace(/"/g, '').trim();

  if (!dbUrl) {
    console.error('❌ DATABASE_URL value is empty in .env.local!');
    process.exit(1);
  }

  console.log('✅ Found DATABASE_URL. Starting migration...');

  try {
    // Set the environment variable for the child process
    const env = { ...process.env, DATABASE_URL: dbUrl };
    
    // Define the command to run
    const command = 'npx prisma migrate dev --name init';
    
    // Execute the command synchronously
    execSync(command, { stdio: 'inherit', env, cwd: projectRoot });
    
    console.log('✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
    process.exit(1);
  }
}

migrate(); 