#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const { cwd } = require('process');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt user for input
function prompt(question, defaultValue = '') {
  return new Promise((resolve) => {
    const promptText = defaultValue ? `${question} [Default: ${defaultValue}]: ` : `${question}: `;
    rl.question(promptText, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

// Helper function to execute commands
function execOrLog(command, dryRun = false) {
  if (dryRun) {
    console.log(`DRY RUN: ${command}`);
  } else {
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error executing command: ${command}`);
      process.exit(1);
    }
  }
}

// Helper function to update version in file using regex
function updateVersionInFile(filePath, version, patterns, dryRun) {
  if (!fs.existsSync(filePath)) {
    console.error(`${filePath} not found!`);
    process.exit(1);
  }

  if (dryRun) {
    console.log(`DRY RUN: Updating ${filePath} to version ${version}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  patterns.forEach(pattern => {
    content = content.replace(pattern.regex, pattern.replacement(version));
  });

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath} to version ${version}`);
}

// Helper function to update package.json version
function updatePackageJsonVersion(filePath, version, dryRun) {
  if (!fs.existsSync(filePath)) {
    console.error(`${filePath} not found!`);
    return;
  }

  if (dryRun) {
    console.log(`DRY RUN: Updating ${filePath} to version ${version}`);
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  packageJson.version = version;
  fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`Updated ${filePath} to version ${version}`);
}

// Help function
function showHelp() {
  console.log(`
Usage: node scripts/create-version-change.js [version] [options]

Arguments:
  version                    The next version to set (e.g., 3.20.0)

Options:
  -d, --dry-run             Show what would be done without making changes
  -s, --skip-branches       Skip branch creation, only update version files
  -h, --help                Show this help message

Examples:
  node scripts/create-version-change.js                    # Interactive mode
  node scripts/create-version-change.js 3.20.0            # Set version 3.20.0
  node scripts/create-version-change.js 3.20.0 --dry-run  # Dry run with version 3.20.0
  node scripts/create-version-change.js 3.20.0 -s         # Update versions only, no branches
`);
  process.exit(0);
}

// Main function
async function main() {
  try {
    // Check for help flag
    const allArgs = process.argv.slice(2);
    if (allArgs.includes('--help') || allArgs.includes('-h')) {
      showHelp();
    }
    // Get current version from package.json
    if (!fs.existsSync('package.json')) {
      console.error('package.json not found!');
      process.exit(1);
    }

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const currentVersion = packageJson.version;

    // Calculate next minor version for default
    const [major, minor] = currentVersion.split('.').map(Number);
    const nextMinor = minor + 1;
    const defaultNextVersion = `${major}.${nextMinor}.0`;

    // Get command line arguments (skip help flag)
    const args = allArgs.filter(arg => !['--help', '-h'].includes(arg));
    let nextVersion = args[0];
    let dryRun = false;
    let skipBranches = false;

    // Parse command line arguments
    for (let i = 1; i < args.length; i++) {
      if (args[i] === '--dry-run' || args[i] === '-d') {
        dryRun = true;
      } else if (args[i] === '--skip-branches' || args[i] === '-s') {
        skipBranches = true;
      }
    }

    // Accept next version as input (default: next minor version)
    if (!nextVersion) {
      nextVersion = await prompt('Enter next version for main (new dev version)', defaultNextVersion);
    }

    // Accept dry-run as argument or prompt if not already set
    if (!dryRun && args.length <= 1) {
      const dryRunInput = await prompt('Dry run? (y/N)', 'N');
      dryRun = /^[Yy]$/.test(dryRunInput);
    }

    // Accept skip-branches as prompt if not already set
    if (!skipBranches && args.length <= 1) {
      const skipBranchesInput = await prompt('Skip branch creation? (y/N)', 'N');
      skipBranches = /^[Yy]$/.test(skipBranchesInput);
    }

    const branchName = `${major}.${minor}`;

    // Get current git branch
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

    console.log(`Current version (from package.json): ${currentVersion}`);
    console.log(`Next version (input/dev bump): ${nextVersion}`);
    console.log(`Branch name: ${branchName}`);
    console.log(`Dry run: ${dryRun}`);
    console.log(`Skip branches: ${skipBranches}`);
    console.log(`Base branch: ${currentBranch}`);

    // Set the version to use for updates
    const versionToUse = nextVersion;

    // 1. Branch logic (skip if --skip-branches flag is set)
    const devBranch = `version-${versionToUse}-to-main`;

    if (!skipBranches) {
      // Only create the release branch if not exists
      execOrLog('git fetch origin main', dryRun);
      
      try {
        execSync(`git show-ref --verify --quiet refs/heads/origin/${branchName}`, { stdio: 'ignore' });
        console.log(`Branch ${branchName} already exists remotely.`);
        rl.close();
        return;
      } catch (error) {
        // Branch doesn't exist, create it
        execOrLog(`git checkout -b ${branchName} origin/main`, dryRun);
        execOrLog(`git push origin ${branchName}`, dryRun);
        console.log(`Created and pushed branch ${branchName} from main.`);
        execOrLog('git checkout main', dryRun);
      }
      
      execOrLog(`git checkout -b ${devBranch} main`, dryRun);
    } else {
      console.log('Skipping branch creation as requested.');
    }

    // Update elementor.php
    if (fs.existsSync('elementor.php')) {
      console.log('Updating elementor.php to next version...');
      updateVersionInFile('elementor.php', versionToUse, [
        {
          regex: /(\* Version: )[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9]+)?/,
          replacement: (version) => `$1${version}`
        },
        {
          regex: /(define\( 'ELEMENTOR_VERSION', ')[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9]+)?'( \);)/,
          replacement: (version) => `$1${version}'$3`
        }
      ], dryRun);
    } else {
      console.error('elementor.php not found!');
      process.exit(1);
    }

    // Update main package.json
    if (fs.existsSync('package.json')) {
      console.log('Updating package.json to next version...');
      updatePackageJsonVersion('package.json', versionToUse, dryRun);
      execOrLog('npm i', dryRun);
    } else {
      console.error('package.json not found!');
      process.exit(1);
    }

    // Update package.json files in packages folder
    const packagesDir = path.join(cwd(), 'packages');
    if (fs.existsSync(packagesDir)) {
      console.log('Updating package.json files in packages folder...');
      const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      packages.forEach(packageName => {
        const packageJsonPath = path.join(packagesDir, packageName, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          updatePackageJsonVersion(packageJsonPath, versionToUse, dryRun);
        }
      });
    }

    // Run npm run packages:version with the new version
    console.log(`Running npm run packages:version with version ${nextVersion}...`);
    execOrLog(`npm run packages:version ${nextVersion}`, dryRun);

    if (skipBranches) {
      console.log('Version bump complete. All version files have been updated.');
      console.log('Done! Please review the changes and commit them.');
    } else {
      console.log(`Version bump complete. Please open a PR from ${devBranch} to main.`);
      console.log('Done! Please review the changes and commit them.');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
if (require.main === module) {
  main();
} 