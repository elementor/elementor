// playwright.config.js
// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  timeout: 10000,
  globalTimeout: 600000,
  reporter: 'line',
  testDir: '../',
  retries:1,
  use: {
    baseURL:'http://localhost:8888/wp-admin/plugins.php',
    viewport: { width: 1940, height: 960 },
    video: 'on-first-retry',
  },
};

module.exports = config;

