'use strict';

const { repoToOwnerAndOwner, getPrCommits } = require('./repo-utils');
const { Octokit } = require("@octokit/core");

const { REPOSITORY, CURRENT_SHA , TOKEN } = process.env;
const octokit = new Octokit({ auth: TOKEN });
const IGNORE_CHECKS_LIST = process.env.IGNORE_CHECKS_LIST.split(',');

(async () => {
	try {
		const { owner, repo } = repoToOwnerAndOwner(REPOSITORY);
		const result = await octokit.request(
			'GET /repos/{owner}/{repo}/commits/{ref}/check-runs?per_page=100',
			{
			  owner,
			  repo,
			  ref: CURRENT_SHA
			}
		  )
		  const checkRuns = result.data.check_runs;
		  const successfulCheckRuns = [];
		  checkRuns.forEach(checkRun => {
			console.log(`${checkRun.name} ${checkRun.status} - conclusion: ${checkRun.conclusion}`);
			if( IGNORE_CHECKS_LIST.includes(checkRun.name) ) {
				return;
			}

			// In case of few checks the last one is success and the previous one is failure
			if ( successfulCheckRuns.includes( checkRun.name ) ) {
				return;
			}

			if( checkRun.conclusion === 'success' ) {
				successfulCheckRuns.push(checkRun.name);
			}

			if (checkRun.status === 'queued' || checkRun.status === 'in_progress') {
				throw new Error(`Check run ${checkRun.name} is ${checkRun.status}, aborting deploy process, please wait for all checks to complete`);
			}
			if (checkRun.conclusion === 'failure') {
				throw new Error(`Check run ${checkRun.name} failed with conclusion ${checkRun.conclusion}, message: ${checkRun.output.summary || checkRun.output.text || 'no message'}`);
			}
		  }
		  );
	} catch (err) {
		console.error(`Failed to get check runs: ${err}`);
		process.exit(1);
	}
})();
