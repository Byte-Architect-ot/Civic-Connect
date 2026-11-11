const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const mlDir = path.join(__dirname, '..', 'ml-service');
const venvWin = path.join(mlDir, 'venv', 'Scripts', 'python.exe');
const venvUnix = path.join(mlDir, 'venv', 'bin', 'python');
const venvUnix3 = path.join(mlDir, 'venv', 'bin', 'python3');

let pythonCmd = 'python';
if (fs.existsSync(venvWin)) {
  pythonCmd = venvWin;
} else if (fs.existsSync(venvUnix)) {
  pythonCmd = venvUnix;
} else if (fs.existsSync(venvUnix3)) {
  pythonCmd = venvUnix3;
} else {
  pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
}

console.log(`[ML-SERVICE] Launching uvicorn using: ${pythonCmd}`);

const child = spawn(pythonCmd, ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'], {
  cwd: mlDir,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
