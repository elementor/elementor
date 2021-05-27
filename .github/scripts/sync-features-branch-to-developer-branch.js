'use strict';

const {
	repoToOwnerAndOwner,
	getFeatureBranches,
	mergeBranch,
} = require('./repo-utils');

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

const { owner, repo } = repoToOwnerAndOwner(REPOSITORY);

(async () => {
	try {
		const featureBranches = await getFeatureBranches(TOKEN, owner, repo);
		for (const branchName of featureBranches) {
			await mergeBranch(TOKEN, owner, repo, TARGET_BRANCH, branchName, `Auto merge feature branch: ${branchName}`);
		}
	} catch (err) {
		console.error(`Failed to merge feature branches to: ${TARGET_BRANCH} branch ${err.head ? `from: ${err.head} branch` : ''} error: ${err.message}`);
		process.exit(1);
	}
})();
