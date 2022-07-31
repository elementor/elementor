'use strict';

const { repoToOwnerAndOwner, getPrCommits } = require('../../scripts/repo-utils');
const { Octokit } = require("@octokit/core");

const { REPOSITORY, BRANCH , TOKEN } = process.env;
const octokit = new Octokit({ auth: TOKEN });

(async () => {
	try {

		const { owner, repo } = repoToOwnerAndOwner(REPOSITORY);
		const releases = await octokit.request(
			'GET /repos/{owner}/{repo}/releases?per_page=100',
			{ owner, repo }
		);

		const cloudReleases = releases.data.find(release => release.tag_name.includes('cloud'));
		if(!cloudReleases) {
			throw new Error(`No releases found with tag name containing "cloud"`);
		}

		const releasesJson = JSON.stringify(cloudReleases, null, 2);
		const releasesJsonBase64 = Buffer.from(releasesJson).toString('base64');
		const releasesJsonSha = await octokit.request(
			'POST /repos/{owner}/{repo}/contents/releases.json',
			{
				owner, repo },
			{
				body: JSON.stringify({
					message: `Update releases.json`,
					content: releasesJsonBase64,
					sha: cloudReleases.sha,
					branch: BRANCH
				})
			}
		);

		console.log(`Releases.json updated with sha ${releasesJsonSha.data.content.sha}`);

	} catch (err) {
		console.error(`Failed to update releases.json: ${err}`);
		process.exit(1);
	}
})();
