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

// Helper function to safely write to GITHUB_OUTPUT
function setOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) {
    return;
  }

  if (!/^\w+$/.test(name)) {
    throw new Error(`Invalid output name: ${name}. Must match /^\\w+$/`);
  }

  if (/[\r\n]/.test(value)) {
    throw new Error(`Output value contains newline characters: ${name}`);
  }

  const outputPath = path.resolve(process.env.GITHUB_OUTPUT);
  const outputLine = `${name}=${value}\n`;
  fs.appendFileSync(outputPath, outputLine, 'utf8');
  console.log(`Set GitHub output: ${name}=${value}`);
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
    content = content.replace(pattern.regex, (...args) => pattern.replacement(version, ...args));
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
  -s, --skip-beta-reset     Skip resetting release/beta to main, only update version files
      --skip-branches       (Deprecated alias for --skip-beta-reset)
  -f, --force-beta-reset    Force reset release/beta even if it has unique commits (downgrades failure to warning)
  --ci                      CI mode: use all default values, no prompts
  -h, --help                Show this help message

Examples:
  node scripts/create-version-change.js                    # Interactive mode
  node scripts/create-version-change.js 3.20.0            # Set version 3.20.0
  node scripts/create-version-change.js 3.20.0 --dry-run  # Dry run with version 3.20.0
  node scripts/create-version-change.js 3.20.0 -s         # Update versions only, no beta reset
  node scripts/create-version-change.js --ci               # CI mode with default version
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
    const isCI = allArgs.includes('--ci');
    const argsWithoutCI = args.filter(arg => arg !== '--ci');
    
    let nextVersion = argsWithoutCI[0];
    let dryRun = false;
    let skipBetaReset = false;
    let forceBetaReset = false;

    // Parse command line arguments
    for (let i = 1; i < argsWithoutCI.length; i++) {
      if (argsWithoutCI[i] === '--dry-run' || argsWithoutCI[i] === '-d') {
        dryRun = true;
      } else if (argsWithoutCI[i] === '--skip-beta-reset' || argsWithoutCI[i] === '-s' || argsWithoutCI[i] === '--skip-branches') {
        skipBetaReset = true;
        if (argsWithoutCI[i] === '--skip-branches') {
          console.log('Warning: --skip-branches is deprecated, use --skip-beta-reset instead');
        }
      } else if (argsWithoutCI[i] === '--force-beta-reset' || argsWithoutCI[i] === '-f') {
        forceBetaReset = true;
      }
    }

    // Accept next version as input (default: next minor version)
    if (!nextVersion) {
      if (isCI) {
        nextVersion = defaultNextVersion;
      } else {
        nextVersion = await prompt('Enter next version for main (new dev version)', defaultNextVersion);
      }
    }

    // Accept dry-run as argument or prompt if not already set
    if (!dryRun && !isCI && argsWithoutCI.length <= 1) {
      const dryRunInput = await prompt('Dry run? (y/N)', 'N');
      dryRun = /^[Yy]$/.test(dryRunInput);
    }

    // Accept skip-beta-reset as prompt if not already set
    if (!skipBetaReset && !isCI && argsWithoutCI.length <= 1) {
      const skipBetaResetInput = await prompt('Skip resetting release/beta to main? (y/N)', 'N');
      skipBetaReset = /^[Yy]$/.test(skipBetaResetInput);
    }

    // Get current git branch
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

    console.log(`Current version (from package.json): ${currentVersion}`);
    console.log(`Next version (input/dev bump): ${nextVersion}`);
    console.log(`Dry run: ${dryRun}`);
    console.log(`Skip beta reset: ${skipBetaReset}`);
    console.log(`Force beta reset: ${forceBetaReset}`);
    console.log(`Base branch: ${currentBranch}`);

    // Set the version to use for updates
    const versionToUse = nextVersion;

    // 1. Reset release/beta to main (skip if --skip-beta-reset flag is set)
    const devBranch = `version-${versionToUse}-to-main`;

    // Always fetch main
    console.log('Fetching origin/main...');
    try {
      execSync('git fetch origin main', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error fetching origin/main');
      process.exit(1);
    }

    if (!skipBetaReset) {
      console.log('Fetching origin/release/beta...');
      try {
        execSync('git fetch origin release/beta', { stdio: 'inherit' });
      } catch (error) {
        console.error('Error fetching remote branches');
        process.exit(1);
      }
      
      // Capture release/beta SHA for --force-with-lease
      let releaseBetaSha;
      try {
        releaseBetaSha = execSync('git rev-parse origin/release/beta', { encoding: 'utf8' }).trim();
        console.log(`release/beta is at ${releaseBetaSha}`);
      } catch (error) {
        console.error('Error getting release/beta SHA');
        process.exit(1);
      }

      // Safety guard: check if release/beta has unique commits (patch-equivalence check)
      console.log('Checking for unique commits on release/beta (cherry-pick equivalence)...');
      let uniqueCommits;
      try {
        uniqueCommits = execSync('git log --cherry-pick --right-only --no-merges --format=\'%h %s\' origin/main...origin/release/beta', { encoding: 'utf8' }).trim();
      } catch (error) {
        console.error('Error checking commit diff between main and release/beta');
        process.exit(1);
      }

      if (uniqueCommits) {
        const commitCount = uniqueCommits.split('\n').length;
        console.log(`Found ${commitCount} unique commit(s) on release/beta not in main:`);
        console.log(uniqueCommits);
        
        if (forceBetaReset) {
          console.log('WARNING: Proceeding with reset due to --force-beta-reset flag');
        } else {
          console.error('ERROR: release/beta has unique commits not in main. Cannot reset release/beta.');
          console.error('Use --force-beta-reset to override this check (downgrades to warning).');
          rl.close();
          process.exit(1);
        }
      } else {
        console.log('release/beta has no unique commits. Safe to reset.');
      }

      // Warn about open PRs targeting release/beta if gh is available
      try {
        execSync('command -v gh', { stdio: 'ignore' });
        const openPRs = execSync('gh pr list --base release/beta --state open --json number,title --jq \'.[] | "#\\(.number): \\(.title)"\'', { encoding: 'utf8' }).trim();
        if (openPRs) {
          console.log('WARNING: The following open PRs target release/beta and will become stale after the reset:');
          console.log(openPRs);
        }
      } catch (error) {
        // gh not available or no open PRs, continue
      }

      // Reset release/beta to origin/main
      const resetCommand = `git push --force-with-lease=release/beta:${releaseBetaSha} origin origin/main:refs/heads/release/beta`;
      if (dryRun) {
        console.log(`DRY RUN: ${resetCommand}`);
      } else {
        try {
          execSync(resetCommand, { stdio: 'inherit' });
          console.log('Successfully reset release/beta to main.');
        } catch (error) {
          console.error('Error resetting release/beta to main');
          process.exit(1);
        }

        // Write outputs for GitHub Actions (after successful reset)
        try {
          const betaVersion = `${major}.${minor}`;
          setOutput('beta_reset', 'true');
          setOutput('beta_version', betaVersion);
        } catch (error) {
          console.error('Reset succeeded but failed to write GitHub outputs:', error.message);
          process.exit(1);
        }
      }
    } else {
      console.log('Skipping release/beta reset as requested.');
    }

    // Create dev branch from origin/main for version bump
    execOrLog(`git checkout -b ${devBranch} origin/main`, dryRun);

    // Update elementor.php
    if (fs.existsSync('elementor.php')) {
      console.log('Updating elementor.php to next version...');
      updateVersionInFile('elementor.php', versionToUse, [
        {
          regex: /(\* Version: )[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9]+)?/,
          replacement: (version, match, prefix) => `${prefix}${version}`
        },
        {
          regex: /(define\( 'ELEMENTOR_VERSION', ')[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9]+)?'( \);)/,
          replacement: (version, match, prefix, _preRelease, suffix) => `${prefix}${version}'${suffix}`
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

    console.log(`Version bump complete. Please open a PR from ${devBranch} to main.`);
    console.log('Done! Please review the changes and commit them.');

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