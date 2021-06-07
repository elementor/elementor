'use strict';

const {
	repoToOwnerAndOwner,
	getFeatureBranches,
	mergeBranch,
} = require('./repo-utils');

const { REPOSITORY, TOKEN, NEXT_RELEASE_BRANCH } = process.env;

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

if (!NEXT_RELEASE_BRANCH) {
	console.error('missing NEXT_RELEASE_BRANCH env var');
	process.exit(1);
	return;
}

const { owner, repo } = repoToOwnerAndOwner(REPOSITORY);

(async () => {
	try {
		const featureBranches = await getFeatureBranches(TOKEN, owner, repo);
		for (const branchName of featureBranches) {
			await mergeBranch(TOKEN, owner, repo, branchName, NEXT_RELEASE_BRANCH, `Auto merge ${NEXT_RELEASE_BRANCH} branch into feature branch: ${branchName}`);
		}
	} catch (err) {
		console.error(`Failed to merge ${NEXT_RELEASE_BRANCH} branch into ${err.base || ''} error: ${err.message}`);
		process.exit(1);
	}
})();
