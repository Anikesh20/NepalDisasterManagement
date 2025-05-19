/**
 * Reset Project Script
 * 
 * This script helps to reset the project to a clean state by:
 * 1. Removing node_modules directory
 * 2. Clearing npm cache
 * 3. Reinstalling dependencies
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting project reset...');

try {
  // Check if node_modules exists and remove it
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('Removing node_modules directory...');
    if (process.platform === 'win32') {
      // Windows requires a different approach for deleting large directories
      execSync('rmdir /s /q "' + nodeModulesPath + '"', { stdio: 'inherit' });
    } else {
      execSync('rm -rf "' + nodeModulesPath + '"', { stdio: 'inherit' });
    }
  }

  // Clear npm cache
  console.log('Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // Reinstall dependencies
  console.log('Reinstalling dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('Project reset completed successfully!');
} catch (error) {
  console.error('Error during project reset:', error.message);
  process.exit(1);
}
