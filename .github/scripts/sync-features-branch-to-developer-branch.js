'use strict';

const { repoToOwnerAndOwner } = require('./repo-utils');
const { Octokit } = require("@octokit/core");
const { REPOSITORY, TOKEN } = process.env;

const TARGET_BRANCH = 'developer-edition';

if (!TOKEN) {
	console.error('missing TOKEN env var');
	process.exit(1);
	return;
}

if (!REPOSITORY) {
	console.error('missing REPOSITORY env var');
	process.exit(1);
	return;
}

const octokit = new Octokit({ auth: TOKEN });
const { owner, repo } = repoToOwnerAndOwner(REPOSITORY);

const mergeBranch = async (branchName, commitMessage) => {
	try {
		await octokit.request('POST /repos/{owner}/{repo}/merges', {
			owner,
			repo,
			base: TARGET_BRANCH,
			head: branchName,
			commit_message: commitMessage
		});
	} catch (err) {
		err.branchName = branchName;
		throw err;
	}
}


(async () => {
	try {
		const res = await octokit.request('GET /repos/{owner}/{repo}/branches', {
			owner,
			repo,
		});
		const featureBranches = res.data.map(({ name }) => name).filter((name) => name.startsWith('feature/'));
		for (const branchName of featureBranches) {
			await mergeBranch(branchName, `Auto merge feature branch: ${branchName}`);
		}
	} catch (err) {
		console.error(`Failed to merge feature branches to: ${TARGET_BRANCH} branch ${err.branchName ? `from: ${err.branchName} branch` : ''} error: ${err.message}`);
		process.exit(1);
	}
})();
