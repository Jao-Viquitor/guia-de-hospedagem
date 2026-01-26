import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Run Angular build
console.log('Building Angular app...');
execSync('ng build', { stdio: 'inherit' });

// Inject environment variables into the built HTML
const indexPath = join(__dirname, 'dist', 'index.html');
let html = readFileSync(indexPath, 'utf8');

const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Replace the placeholder with actual environment variable
html = html.replace(
  `VITE_GOOGLE_MAPS_API_KEY: typeof process !== 'undefined' && process.env?.VITE_GOOGLE_MAPS_API_KEY || ''`,
  `VITE_GOOGLE_MAPS_API_KEY: '${apiKey}'`
);

writeFileSync(indexPath, html);
console.log('Environment variables injected successfully!');

