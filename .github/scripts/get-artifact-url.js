'use strict';


const { Octokit } = require("@octokit/rest");

const { TOKEN } = process.env;
const octokit = new Octokit({ auth: TOKEN });

(async () => {
	try {
		const releases = await octokit.paginate(
			octokit.repos.listReleases.endpoint.merge({
				owner: process.env.REPO_OWNER,
				repo: process.env.REPO_NAME,
			})
		);
		for (const release of releases) {
			const assets = release.assets;
			for (const asset of assets) {
				if (asset.name === process.env.FILE_NAME) {
					return asset.browser_download_url;
				}
			}
		}
	} catch (err) {
		console.error(`Failed to get artifact url: ${err}`);
		return '';
	}
})();
