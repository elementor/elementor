const ngrok = require("ngrok");
const { spawn } = require("child_process");

const myArgs = process.argv.slice(2);
const [project, token, ngrokToken] = myArgs

const runProgram = (program, options) => {
  return new Promise((resolve, reject) => {
    const subprocess = spawn(program, options);

    subprocess.stdout.on("data", (data) => {
      console.log(`Data: ${data}`);
    });

    subprocess.stderr.on("data", (data) => {
      console.error(`Error: ${data}`);
    });

    subprocess.on("close", (code) => {
      console.log(`${options[0]} exited with code ${code}`);
      if (code !== 0) reject(code);
      resolve(code);
    });
  })
};

const runTestim = async () => {
  // Start tunnel
  const tunnelUrl = await ngrok.connect({authtoken: ngrokToken, addr:8889});
  try {
    // Use CLI to set local WP tunnel url
    await Promise.all([
      runProgram('npx', [
        "wp-env",
        "run",
        "tests-cli",
        `"wp config set WP_HOME ${tunnelUrl}"`,
      ]),
      runProgram('npx', [
        "wp-env",
        "run",
        "tests-cli",
        `"wp config set WP_SITEURL ${tunnelUrl}"`,
      ]),
    ])
    // Run Testim
    const exitCode = await runProgram('npx',[
      'testim',
      '--project',project,
      '--token',token,
      '--label','CI',
      '--label','Sanity',
      '--grid','Testim-Grid',
      '--base-url',tunnelUrl,
      '--parallel','8',
      '--params', '{"username":"admin","password":"password"}'
    ])
    // Close tunnel
    await ngrok.kill();
    return exitCode
  } catch (e) {
    console.error(e)
    await ngrok.kill();
    return 1
  }
}

runTestim()
  .then(code => process.exit(code))
  .catch(e => process.exit(1))
