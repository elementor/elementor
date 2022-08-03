'use strict';

const { repoToOwnerAndOwner } = require('../../scripts/repo-utils');
const { Octokit } = require("@octokit/rest");
const { promises: fs } = require("fs");
const { REPOSITORY, TOKEN, TAG_NAME_FILTER } = process.env;
const octokit = new Octokit({ auth: TOKEN });

(async () => {
	try {
		const { owner, repo } = repoToOwnerAndOwner(REPOSITORY);
		const releases = await octokit.rest.repos.listReleases({
			owner,
			repo,
			per_page: 100
		});
		console.log(releases);
		let cloudReleases = releases.data.filter(release => release.tag_name.includes(TAG_NAME_FILTER));
		if (!cloudReleases) {
			throw new Error(`No releases found with tag name containing "${TAG_NAME_FILTER}"`);
		}

		const releasesJson = JSON.stringify(cloudReleases, null, 2);
		const releasesDir = `./releases`;
		const releasesFilePath = `${releasesDir}/${TAG_NAME_FILTER}.json`;
		console.log(`Saving ${releasesFilePath}`);
		await fs.writeFile(releasesFilePath, releasesJson);
		console.log(`Saved ${releasesFilePath}`);
		process.exit(0);
	} catch (err) {
		console.error(`Failed to update cloudReleases.json: ${err}`);
		process.exit(1);
	}
})();
