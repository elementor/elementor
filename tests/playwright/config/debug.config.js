// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  timeout: 10000,
  globalTimeout: 600000,
  reporter: 'line',
  testDir: '../',
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    video: 'on',
  },
};

module.exports = config;
