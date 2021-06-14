const ngrok = require("ngrok");
const { spawn } = require("child_process");

const myArgs = process.argv.slice(2);
const [project, token] = myArgs

const runProgram = (program, options) => {
  return new Promise((resolve, reject) => {
    const wpCli = spawn(program, options);

    wpCli.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    wpCli.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    wpCli.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      if (code !== 0) reject();
      resolve();
    });
  })
};

(async function () {
  // Start tunnel
  const tunnelUrl = await ngrok.connect(8889);
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
  ]).catch(e => console.error(e));;
  // Run Testim
  await runProgram('npx',[
    'testim',
    '--project',project,
    '--token',token,
    '--label','test',
    '--grid','Testim-Grid',
    '--base-url',tunnelUrl
  ]).catch(e => console.error(e));
  // Close tunnel
  await ngrok.kill();
})();