const { Octokit } = require('octokit')
const fs = require('fs')
const { Parser } = require('json2csv');

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN
})

const { baseBranch, headTag, repositoryName: repo, owner } = process.env
filters = process.env.filters.split(',')

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
		if (pr.base.ref === baseBranch && prMergeDate > releaseDate) {
			return true
		}
	})

    let newPullRequestsFilterd = pullRequestsAfterRelease

	if (filters.length > 0) {
		newPullRequestsFilterd = newPullRequestsFilterd.filter(pullRequest => {
			return !filters.some(filter => pullRequest.title.includes(filter))
		})
	}

    newPullRequestsFilterd = pullRequestsAfterRelease.map(pullRequest => () => {

        let row = {
            title: pullRequest.title,
            pullRequestURL: pullRequest.html_url,
        }

        let taskNumber = pullRequest.title.match(/\[(.*?)\]/g)
        if (taskNumber) {
            taskNumber = taskNumber[0].replace('[', '').replace(']', '')
            row.JiraTaskURL = `https://elementor.atlassian.net/browse/${taskNumber}`
        }

        return row
    })

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(newPullRequestsFilterd);
    
    fs.writeFile(`changelog-${baseBranch}-${headTag}.csv`, csv, function(err) {
      if (err) throw err;
      console.log('file saved');
    });

})()
