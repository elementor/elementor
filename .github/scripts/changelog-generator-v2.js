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

// Fetch the last 100 commits
async function fetchAllCommits (releaseDate) {
	const { data: commits } = await octokit.rest.repos.listCommits({
		owner,
		repo,
		per_page: 100,
		base: baseBranch
	})

	return commits.filter(commit => {
		const commitDate = new Date(commit.commit.committer.date)
		return commitDate > releaseDate
	})
}


// Filter commits based on commit message
function filterCommits (commits) {
	if (filters.length === 0) {
		return commits
	}

	return commits.filter(commit => {
		return !filters.some(filter => commit.commit.message.includes(filter))
	})
}

// Parse and restructure commits
function parseCommits (commits) {
	return commits.map(commit => {
		let row = {
			message: commit.commit.message,
			commitURL: commit.html_url
		}

		let taskNumber = commit.commit.message.match(/\[(.*?)\]/g)
		if (taskNumber) {
			taskNumber = taskNumber[0].replace('[', '').replace(']', '')
			row.JiraTaskURL = `https://elementor.atlassian.net/browse/${taskNumber}`
		}

		return row
	})
}

// Write to CSV file
function writeToCSV (data) {
	const fields = ['message', 'commitURL', 'JiraTaskURL']
	const json2csvParser = new Parser({ fields })
	const csv = json2csvParser.parse(data)

	fs.writeFile(`changelog-${baseBranch}-${headTag}.csv`, csv, function (err) {
		if (err) throw err
		console.log('file saved')
	})
}

(async () => {
	const releaseDate = await fetchReleaseDetails()
	console.log('releaseDate', releaseDate)

	let commits = await fetchAllCommits(releaseDate)
	commits = filterCommits(commits)
	const parsedCommits = parseCommits(commits)

	writeToCSV(parsedCommits)
})()
