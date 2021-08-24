'use strict';

module.exports.repoToOwnerAndOwner = (repository = '') => {
	const [owner, repo] = repository.split('/');
	return { owner, repo };
};

module.exports.mergeBranch = async (auth, owner, repo, base, head, commitMessage) => {
	const { Octokit } = require("@octokit/core");
	const octokit = new Octokit({ auth });

	try {
		await octokit.request('POST /repos/{owner}/{repo}/merges', {
			owner,
			repo,
			base,
			head,
			commit_message: commitMessage
		});
	} catch (err) {
		err.head = head;
		err.base = base;
		throw err;
	}
}

const getBranches = async (auth, owner, repo) => {
	const { Octokit } = require("@octokit/core");
	const octokit = new Octokit({ auth });

	return await octokit.request('GET /repos/{owner}/{repo}/branches?per_page={per_page}', {
		owner,
		repo,
		per_page: 100,
	});
};

module.exports.getFeatureBranches = async (auth, owner, repo) => {
	const res = await getBranches(auth, owner, repo);
	return res.data.map(({ name }) => name).filter((name) => name.startsWith('feature/'));
}
