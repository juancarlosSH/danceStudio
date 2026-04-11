import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

// ── Bundle JS ─────────────────────────────────────────────────
await esbuild.build({
  entryPoints: ['src/app.ts'],
  bundle:      true,
  outfile:     'dist/bundle.js',
  platform:    'browser',
  target:      'es2020',
  minify:      true,
  sourcemap:   false,
});

// ── Concat CSS ────────────────────────────────────────────────
const cssFiles = [
  'src/styles/themes.css',
  'src/styles/base.css',
  'src/styles/components/buttons.css',
  'src/styles/components/forms.css',
  'src/styles/components/header.css',
  'src/styles/components/cards.css',
  'src/styles/components/calendar.css',
  'src/styles/components/table.css',
  'src/styles/components/modal.css',
  'src/styles/components/toast.css',
  'src/styles/views/auth.css',
  'src/styles/views/dashboard.css',
];

const css = cssFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/styles.css', css);

// ── Copy index.html ───────────────────────────────────────────
fs.copyFileSync('index.html', 'dist/index.html');

console.log('Build complete → dist/');
