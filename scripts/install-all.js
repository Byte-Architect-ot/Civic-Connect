const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.join(__dirname, '..');

function run(command, cwd) {
  console.log(`\n> [${path.basename(cwd)}] ${command}`);
  execSync(command, { cwd, stdio: 'inherit' });
}

try {
  // 1. Frontend
  run('npm install', path.join(rootDir, 'frontend'));

  // 2. Backend
  run('npm install', path.join(rootDir, 'backend'));

  // 3. Chatbot service
  run('npm install', path.join(rootDir, 'chatbot-service'));

  // 4. ML service python venv & requirements
  const mlDir = path.join(rootDir, 'ml-service');
  const venvDir = path.join(mlDir, 'venv');
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

  if (!fs.existsSync(venvDir)) {
    console.log('\n> Creating Python virtual environment in ml-service/venv...');
    run(`${pythonCmd} -m venv venv`, mlDir);
  }

  const venvPip = process.platform === 'win32'
    ? path.join(venvDir, 'Scripts', 'pip.exe')
    : path.join(venvDir, 'bin', 'pip');

  const pipCmd = fs.existsSync(venvPip) ? `"${venvPip}"` : 'pip';
  run(`${pipCmd} install -r requirements.txt`, mlDir);

  console.log('\nAll project dependencies successfully installed!');
} catch (err) {
  console.error('\nInstallation failed:', err.message);
  process.exit(1);
}
