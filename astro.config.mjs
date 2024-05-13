import { defineConfig } from 'astro/config';
import vue from "@astrojs/vue";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],
  output: "server",
  site: 'https://matemaki33.github.io',
  adapter: node({
    mode: "standalone"
  })
});
