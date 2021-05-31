'use strict';

const fs = require('fs');
const { Octokit } = require('@octokit/core');
const { repoToOwnerAndOwner } = require('./repo-utils');
const { REPOSITORY, HEAD_BRANCH_NAME, BASE_TAG_NAME, TOKEN } = process.env;

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

if (!HEAD_BRANCH_NAME) {
	console.error('missing HEAD_BRANCH_NAME env var');
	process.exit(1);
	return;
}

if (!BASE_TAG_NAME) {
	console.error('missing BASE_TAG_NAME env var');
	process.exit(1);
	return;
}

const octokit = new Octokit({ auth: TOKEN });
const { owner, repo } = repoToOwnerAndOwner(REPOSITORY);

(async () => {
	try {
		const res = await octokit.request('GET /repos/{owner}/{repo}/compare/{base}...{head}', {
			owner,
			repo,
			base: BASE_TAG_NAME,
			head: HEAD_BRANCH_NAME,
		});
		const prAndVerifiedCommits = res.data.commits
			.filter(({ commit }) => commit.verification.verified)
			.map(({ commit }) => commit.message)
			.map(message => message.split('\n')[0])
			.filter((message) => /\(#\d{1,72}\)/.test(message))
			.filter((message) => !message.startsWith('Internal:'));
		const markdown = prAndVerifiedCommits.map((message) => `* ${message}`).join('\n');
		fs.writeFileSync('temp-changelog.txt', markdown);
	} catch (err) {
		process.exit(1);
	}
})();
