#!/usr/bin/env node
/**
 * Postinstall hook for Hexo post processor fixes:
 * 1) Normalize CRLF to LF before front-matter parse (so Windows-edited posts parse correctly)
 * 2) Preserve front-matter slug instead of always overwriting with filename-derived title
 */

const fs = require('fs');
const path = require('path');

const processorPostPath = path.join(__dirname, 'node_modules/hexo/dist/plugins/processor/post.js');

if (!fs.existsSync(processorPostPath)) {
  console.log('ℹ Hexo processor file not found, skipping patch.');
  process.exit(0);
}

const content = fs.readFileSync(processorPostPath, 'utf8');

let patched = content;

patched = patched.replace(
  "const data = (0, hexo_front_matter_1.parse)(content);",
  "const normalizedContent = content.replace(/\\r\\n/g, '\\n');\n        const data = (0, hexo_front_matter_1.parse)(normalizedContent);"
);

patched = patched.replace(
  'data.slug = info.title;',
  'data.slug = data.slug || info.title;'
);

if (patched === content) {
  console.log('✓ Hexo processor patches already applied.');
  process.exit(0);
}

fs.writeFileSync(processorPostPath, patched);
console.log('✓ Hexo processor patches applied successfully.');
