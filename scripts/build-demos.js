import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const webStudioDir = path.resolve(__dirname, '..');
const potDir = path.resolve(webStudioDir, '..');
const demosDir = path.resolve(potDir, 'Demos');

const DEMOS = [
  { name: 'universe', path: path.join(demosDir, 'universe') },
  { name: 'dog-breeds', path: path.join(demosDir, 'dog-breeds') },
  { name: 'tempo-landing', path: path.join(demosDir, 'tempo-landing') }
];

console.log('Starting build-demos pipeline...');

for (const demo of DEMOS) {
  console.log(`\n========================================`);
  console.log(`Building demo: ${demo.name}`);
  console.log(`Path: ${demo.path}`);
  console.log(`========================================`);

  if (!fs.existsSync(demo.path)) {
    console.error(`Error: Demo path does not exist: ${demo.path}`);
    continue;
  }

  // Install dependencies if node_modules doesn't exist
  const nodeModulesPath = path.join(demo.path, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('node_modules not found. Running npm install...');
    execSync('npm install', { cwd: demo.path, stdio: 'inherit' });
  }

  // Build the demo
  console.log('Running npm run build...');
  execSync('npm run build', { cwd: demo.path, stdio: 'inherit' });

  // Define and clear target directory in web-studio public folder
  const targetDir = path.join(webStudioDir, 'public', 'd', demo.name);
  console.log(`Copying built files to: ${targetDir}`);
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  // Copy files
  const distDir = path.join(demo.path, 'dist');
  copyFolderSync(distDir, targetDir);
  console.log(`Successfully built and copied ${demo.name}!`);
}

function copyFolderSync(from, to) {
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach((element) => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

console.log('\nAll demos built and copied successfully!');
