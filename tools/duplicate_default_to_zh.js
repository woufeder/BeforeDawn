const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const publicDir = path.join(repoRoot, 'public');
const zhDir = path.join(publicDir, 'zh-tw');

const candidates = [
  'blog',
  'about',
  'original',
  'project',
  'music',
  'others',
  'blog/archives',
  'blog/tags',
  'blog/categories'
];

function copyRecursiveSync(src, dest){
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()){
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)){
      copyRecursiveSync(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function ensureDir(p){ if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

ensureDir(zhDir);

candidates.forEach(c => {
  const src = path.join(publicDir, c);
  const dest = path.join(zhDir, c);
  if (fs.existsSync(src)){
    console.log('Copying', src, '->', dest);
    copyRecursiveSync(src, dest);
  }
});

const blogIndex = path.join(publicDir, 'blog', 'index.html');
if (fs.existsSync(blogIndex)){
  const target = path.join(zhDir, 'blog');
  ensureDir(target);
  fs.copyFileSync(blogIndex, path.join(target, 'index.html'));
  console.log('Copied blog index to', path.join(target, 'index.html'));
}

console.log('Done duplicating default pages to /zh-tw/.');