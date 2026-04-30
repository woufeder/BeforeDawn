'use strict';

const fs = require('fs');
const path = require('path');

const deployRepoPath = path.join(process.cwd(), '.deploy_git');

if (fs.existsSync(deployRepoPath)) {
  fs.rmSync(deployRepoPath, { recursive: true, force: true });
  console.log('[deploy] Removed stale .deploy_git to preserve path casing.');
} else {
  console.log('[deploy] .deploy_git not found, nothing to reset.');
}
