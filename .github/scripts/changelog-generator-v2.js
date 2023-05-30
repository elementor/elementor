const { Octokit } = require('octokit')
const fs = require('fs')
const { Parser } = require('json2csv')

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN
})

const { baseBranch, headTag, repositoryName: repo, owner } = process.env

const filters = process.env.filters.split(',')

// Fetch release details
async function fetchReleaseDetails () {
	const release = await octokit.rest.repos.getReleaseByTag({
		owner,
		repo,
		tag: headTag
	})
	return new Date(release.data.created_at)
}

// Fetch all pull requests with pagination
async function fetchAllPullRequests (releaseDate) {
	const pullRequests = await octokit.paginate(octokit.rest.pulls.list, {
		owner,
		repo,
		per_page: 100,
		sort: 'updated',
		direction: 'desc',
		state: 'closed',
		base: baseBranch
	})

	return pullRequests.filter(pr => {
		if (pr.merged_at === null) return false
		const prMergeDate = new Date(pr.merged_at)
		return pr.base.ref === baseBranch && prMergeDate > releaseDate
	})
}

// Filter pull requests based on title
function filterPullRequests (pullRequests) {
	if (filters.length === 0) {
		return pullRequests
	}

	return pullRequests.filter(pullRequest => {
		return !filters.some(filter => pullRequest.title.includes(filter))
	})
}

// Parse and restructure pull requests
function parsePullRequests (pullRequests) {
	return pullRequests.map(pullRequest => {
		let row = {
			title: pullRequest.title,
			pullRequestURL: pullRequest.html_url
		}

		let taskNumber = pullRequest.title.match(/\[(.*?)\]/g)
		if (taskNumber) {
			taskNumber = taskNumber[0].replace('[', '').replace(']', '')
			row.JiraTaskURL = `https://elementor.atlassian.net/browse/${taskNumber}`
		}

		return row
	})
}

// Write to CSV file
function writeToCSV (data) {
	const fields = ['title', 'pullRequestURL', 'JiraTaskURL']
	const json2csvParser = new Parser({ fields })
	const csv = json2csvParser.parse(data)

	fs.writeFile(`changelog-${baseBranch}-${headTag}.csv`, csv, function (err) {
		if (err) throw err
		console.log('file saved')
	})
}

;(async () => {
	const releaseDate = await fetchReleaseDetails()
	console.log('releaseDate', releaseDate)

	let pullRequests = await fetchAllPullRequests(releaseDate)
	pullRequests = filterPullRequests(pullRequests)
	const parsedPullRequests = parsePullRequests(pullRequests)

	writeToCSV(parsedPullRequests)
})()
