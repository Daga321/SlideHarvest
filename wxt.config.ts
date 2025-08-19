import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'SlideHarvest',
    description: 'A web application for downloading embedded slide presentations',
    permissions: [
      'popup',
      'activeTab',
      'tabs',
      'downloads',
      'offscreen',
      'storage'
    ]
  }
});
