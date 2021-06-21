const ngrok = require("ngrok");
const { spawn } = require("child_process");

const myArgs = process.argv.slice(2);
const [project, token, ngrokToken] = myArgs

const runProgram = (program, options) => {
  return new Promise((resolve, reject) => {
    const wpCli = spawn(program, options);

    wpCli.stdout.on("data", (data) => {
      console.log(data);
    });

    wpCli.stderr.on("data", (data) => {
      console.error(`Error: ${data}`);
    });

    wpCli.on("close", (code) => {
      console.log(`${options[0]} exited with code ${code}`);
      if (code !== 0) reject(code);
      resolve(code);
    });
  })
};

const runTestim = async () => {
  // Start tunnel
  const tunnelUrl = await ngrok.connect({authtoken: ngrokToken, addr:8889});
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
  ]).catch(e => console.error(e));
  // Run Testim
  const exitCode = await runProgram('npx',[
    'testim',
    '--project',project,
    '--token',token,
    '--label','CI',
    '--grid','Testim-Grid',
    '--base-url',tunnelUrl,
    '--params', '{"username":"admin","password":"password"}'
  ]).catch(e => console.error(e));
  // Close tunnel
  await ngrok.kill();
  return exitCode
}

runTestim().then(code => process.exit(code))