// playwright.config.js
// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  timeout: 30000,
  globalTimeout: 600000,
  reporter: 'line',
  testMatch:/draft/,
  testDir:'../',
  workers:1,
  use: {
    headless: false,
    baseURL:'http://localhost:8888/',
    viewport: { width: 1440, height: 960 },
  },
};

module.exports = config;

