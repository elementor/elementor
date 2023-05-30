const { Octokit } = require('octokit')

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN
})

const { baseBranch, headTag, filters, repository } = process.env
const [repo] = repository.split('/')[1]
const owner = 'elementor'


// run async function code block
;(async () => {
	// Fetch release details
	const release = await octokit.rest.repos.getReleaseByTag({
		owner,
		repo,
		tag: headTag
	})

	const releaseDate = new Date(release.data.created_at)

    console.log('releaseDate', releaseDate)

	// Fetch all pull requests with pagination
	const pullRequests = await octokit.paginate(octokit.rest.pulls.list, {
		owner,
		repo,
		per_page: 100,
		sort: 'updated',
		direction: 'desc',
		state: 'closed',
		base: baseBranch
	})

	// Filter pull requests merged after the release
	const pullRequestsAfterRelease = pullRequests.filter(pr => {
		if (pr.merged_at === null) return false
		const prMergeDate = new Date(pr.merged_at)
		if (pr.base.ref === base && prMergeDate > releaseDate) {
			return true
		}
	})

	let newPullRequestsFilterd = pullRequestsAfterRelease.map(pullRequest => ({
		title: pullRequest.title,
		url: pullRequest.html_url
	}))

	if (filters.length > 0) {
		newPullRequestsFilterd = newPullRequestsFilterd.filter(pullRequest => {
			return !filters.some(filter => pullRequest.title.includes(filter))
		})
	}

	console.table(newPullRequestsFilterd)
})()
