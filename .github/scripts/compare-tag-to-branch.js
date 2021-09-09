'use strict';

const { repoToOwnerAndOwner } = require('./repo-utils');
const { Octokit } = require("@octokit/core");
const { REPOSITORY, HEAD_BRANCH_NAME, BASE_TAG_NAME, TOKEN } = process.env;

if (!TOKEN) {
	console.error('missing TOKEN env var');
	process.exit(1);
	return;
}

if (!BASE_TAG_NAME) {
	console.error('missing BASE_TAG_NAME env var');
	process.exit(1);
	return;
}

if (!HEAD_BRANCH_NAME) {
	console.error('missing HEAD_BRANCH_NAME env var');
	process.exit(1);
	return;
}

if (!REPOSITORY) {
	console.error('missing REPOSITORY env var');
	process.exit(1);
	return;
}

const octokit = new Octokit({ auth: TOKEN });

(async () => {
	try {
		const { owner, repo } = repoToOwnerAndOwner(REPOSITORY);
		const res = await octokit.request('GET /repos/{owner}/{repo}/compare/{base}...{head}', {
			owner,
			repo,
			base: BASE_TAG_NAME,
			head: HEAD_BRANCH_NAME,
		});
		const compareStatus = res.data.status;
		console.log(`Tag: ${BASE_TAG_NAME} '${compareStatus}' to branch: ${HEAD_BRANCH_NAME}`);
		if (compareStatus !== 'identical') {
			process.exit(1);
		}
	} catch (err) {
		console.error(`Failed to compare tag: ${BASE_TAG_NAME} to branch: ${HEAD_BRANCH_NAME} error: ${err.message}`);
		process.exit(1);
	}
})();
