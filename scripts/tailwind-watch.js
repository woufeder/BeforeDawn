'use strict';

const { spawn } = require('child_process');
const path = require('path');

hexo.on('server', () => {
  const cli = path.join(path.dirname(require.resolve('@tailwindcss/cli/package.json')), 'dist', 'index.mjs');
  const watcher = spawn(process.execPath, [cli, '-i', './source/assets/css/tailwind.css', '-o', './source/assets/css/app.css', '--watch=always'], {
    cwd: hexo.base_dir,
    stdio: 'inherit'
  });

  watcher.on('error', error => hexo.log.error('Tailwind watcher failed: %s', error.message));
  watcher.on('exit', code => {
    if (code && !watcher.killed) hexo.log.error('Tailwind watcher exited with code %s', code);
  });
  process.on('exit', () => watcher.kill());
});
