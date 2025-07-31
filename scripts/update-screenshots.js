const fs = require('fs');
const path = require('path');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');
const glob = require('glob');

async function findScreenshotPairs(screenshotsDir) {
  const actualFiles = glob.sync(path.join(screenshotsDir, '**/*-actual.png'));
  
  return actualFiles.map(actualPath => {
    const linuxPath = actualPath.replace('-actual.png', '-linux.png');
    const diffPath = actualPath.replace('-actual.png', '-diff.png');
    
    return {
      actualPath,
      linuxPath,
      diffPath,
      name: path.basename(actualPath, '-actual.png')
    };
  }).filter(pair => fs.existsSync(pair.linuxPath));
}

async function createDiffImage(actualPath, linuxPath, diffPath) {
  const actual = PNG.sync.read(fs.readFileSync(actualPath));
  const linux = PNG.sync.read(fs.readFileSync(linuxPath));
  
  const { width, height } = actual;
  const diff = new PNG({ width, height });
  
  const diffPixels = pixelmatch(
    actual.data,
    linux.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );
  
  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  return diffPixels;
}

async function updateScreenshot(pair) {
  fs.copyFileSync(pair.actualPath, pair.linuxPath);
  if (fs.existsSync(pair.diffPath)) {
    fs.unlinkSync(pair.diffPath);
  }
}

async function main() {
  const screenshotsDir = process.env.SCREENSHOTS_DIR || 'tests/screenshots';
  const pairs = await findScreenshotPairs(screenshotsDir);
  
  if (pairs.length === 0) {
    console.log('No screenshot pairs found');
    return;
  }
  
  console.log(`Found ${pairs.length} screenshot pairs`);
  
  for (const pair of pairs) {
    const diffPixels = await createDiffImage(
      pair.actualPath,
      pair.linuxPath,
      pair.diffPath
    );
    
    console.log(JSON.stringify({
      type: 'screenshot_comparison',
      name: pair.name,
      actual: pair.actualPath,
      linux: pair.linuxPath,
      diff: pair.diffPath,
      diffPixels
    }));
  }
}

main().catch(console.error); 