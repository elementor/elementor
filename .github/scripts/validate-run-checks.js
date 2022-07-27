'use strict';

const { repoToOwnerAndOwner, getPrCommits } = require('./repo-utils');
const { Octokit } = require("@octokit/core");
const { REPOSITORY, CURRENT_SHA , TOKEN } = process.env;
const octokit = new Octokit({ auth: TOKEN });
const ignoreChacks = ['publish-to-cloud'];

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
		  checkRuns.forEach(checkRun => {
			if( ignoreChacks.includes(checkRun.name) ) {
				return;
			}
			if (checkRun.status === 'queued' || checkRun.status === 'in_progress') {
				throw new Error(`Check run ${checkRun.name} is ${checkRun.status}, aborting deploy process, please wait for all checks to complete`);
			}
			if (checkRun.conclusion !== 'success') {
				throw new Error(`Check run ${checkRun.name} failed with conclusion ${checkRun.conclusion}, message: ${checkRun.output.summary.text}`);
			}
			console.log(checkRun);
		  }
		  );
	} catch (err) {
		console.error(`Failed to get check runs: ${err}`);
		process.exit(1);
	}
})();
