// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify/functions';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify({
    edgeMiddleware: true,
    functionPerRoute: true
  }),
  vite: {
    define: {
      'process.env.DATABASE_URL': JSON.stringify(process.env.DATABASE_URL),
      'process.env.DATABASE_AUTH_TOKEN': JSON.stringify(process.env.DATABASE_AUTH_TOKEN),
    }
  },
  integrations: [tailwind()]
});
