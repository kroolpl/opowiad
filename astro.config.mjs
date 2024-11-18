// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify/functions';

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  adapter: netlify({
    dist: {
      client: 'dist/client',
      functions: 'dist/functions'
    }
  }),
  integrations: [tailwind()]
});
