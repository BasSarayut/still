import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // GitHub Pages project site serves from https://<user>.github.io/still/, so the production
  // build needs this repo-name subpath baked into asset URLs. Dev server stays at '/' so
  // `npm run dev` and the Playwright tests (which hit http://localhost:5173/) are unaffected;
  // `npm run preview` passes --base to match, see package.json.
  base: command === 'build' ? '/still/' : '/',
  plugins: [react()],
}));
