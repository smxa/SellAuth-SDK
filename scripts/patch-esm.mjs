#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const root = process.cwd();
const distDir = join(root, 'dist');
let changedCount = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (entry.endsWith('.js')) patchFile(full);
  }
}

// Regex handles: import ... from './x'; export * from '../y'; export { a } from './z';
// Avoid adding extension if specifier already has one or is external.
const importExportRE =
  /(import\s+[^'";]+?from\s+|export\s+[^'";]*?from\s+|export\s+\*)from\s+['"](\.\.?\/[^'";]+)['"];?/g;

function patchFile(file) {
  let src = readFileSync(file, 'utf8');
  let orig = src;
  src = src.replace(importExportRE, (full, prefix, spec) => {
    if (/\.[a-zA-Z0-9]+$/.test(spec)) return full; // already has extension
    // Try direct .js file
    const absBase = resolve(dirname(file), spec);
    if (existsSync(absBase + '.js')) {
      changedCount++;
      return `${prefix}from '${spec}.js';`;
    }
    // Try index.js inside directory
    if (existsSync(join(absBase, 'index.js'))) {
      changedCount++;
      return `${prefix}from '${spec}/index.js';`;
    }
    return full; // leave unchanged
  });
  if (src !== orig) {
    writeFileSync(file, src);
    changedCount++;
  }
}

walk(distDir);
// If top-level index.js barrel still has extensionless exports we patch manually
const topIndex = join(distDir, 'index.js');
if (existsSync(topIndex)) {
  let js = readFileSync(topIndex, 'utf8');
  let changed = false;
  js = js.replace(/from '\.(.*?)';/g, (m) => m); // noop placeholder
  // handle export * from './sdk/client'; etc.
  js = js.replace(/export \* from '((\.\.?\/[^'";]+))';/g, (full, spec) => {
    if (/\.[a-zA-Z0-9]+$/.test(spec)) return full;
    const absBase = resolve(dirname(topIndex), spec);
    if (existsSync(absBase + '.js')) {
      changed = true;
      return `export * from '${spec}.js';`;
    }
    if (existsSync(join(absBase, 'index.js'))) {
      changed = true;
      return `export * from '${spec}/index.js';`;
    }
    return full;
  });
  if (changed) {
    writeFileSync(topIndex, js);
    changedCount++;
  }
}

console.log(`[patch-esm] Patched ${changedCount} file(s).`);
if (changedCount === 0) {
  console.warn('[patch-esm] No files patched; ESM may still have extensionless imports.');
}
