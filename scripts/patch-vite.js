import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function patchVite() {
  const depChunkPath = path.join(rootDir, 'node_modules', 'vite', 'dist', 'node', 'chunks');
  if (!fs.existsSync(depChunkPath)) {
    return;
  }

  const chunkFiles = fs.readdirSync(depChunkPath).filter(f => f.startsWith('dep-') && f.endsWith('.js'));
  const runtimePath = path.join(rootDir, 'node_modules', 'vite', 'dist', 'node', 'runtime.js');
  const allFiles = [...chunkFiles.map(f => path.join(depChunkPath, f))];
  if (fs.existsSync(runtimePath)) {
    allFiles.push(runtimePath);
  }

  for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // 1. Fix postfixRE to avoid truncating paths with '#' followed by slashes
    if (content.includes('const postfixRE = /[?#].*$/;')) {
      content = content.replace(/const postfixRE = \/\[\?#\]\.\*\$\/;/g, 'const postfixRE = /[?#][^/\\\\]*$/;');
      modified = true;
    }

    // 2. Fix safeRealpathSync to catch EPERM on OneDrive / restricted environments
    if (content.includes('if (error.message.includes("EISDIR: illegal operation on a directory")) {')) {
      content = content.replace(
        'if (error.message.includes("EISDIR: illegal operation on a directory")) {',
        'if (error) {'
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`[patch-vite] Successfully patched ${path.basename(file)}`);
    }
  }
}

patchVite();
