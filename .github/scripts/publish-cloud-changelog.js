const cheerio = require('cheerio')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const fs = require('fs')
const { Octokit } = require('octokit')
const octokit = new Octokit({ auth: process.env.token })


async function getShaForPath(octokit, owner, repo, path, ref) {
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });
      return response.data.sha;
    } catch (error) {
      return null;
    }
  }

const {
	changeLog,
	owner,
	repo,
	changeLogUrl,
	packageVersion
} = process.env

async function publishToGithubPages (
	octokit,
	owner,
	repo,
	path,
	message,
	htmlContent
) {
	const contentEncoded = Buffer.from(htmlContent, 'utf8').toString('base64')
	try {
        const sha = await getShaForPath(octokit, owner, repo, path, 'gh-pages') ?? null;
		await octokit.rest.repos.createOrUpdateFileContents({
			owner,
			repo,
			path,
			message,
			content: contentEncoded,
			branch: 'gh-pages',
            sha
		})
	} catch (error) {
		console.error('Failed to publish to GitHub Pages:', error)
	}
}

async function generateAndPublishChangelog (octokit, owner, repo, htmlContent) {
	await publishToGithubPages(
		octokit,
		owner,
		repo,
		'index.html',
		'Update changelog',
		htmlContent
	)
}

async function wget (url) {
	const command = `wget --no-check-certificate -e robots=off -P . ${url}`

	try {
		const { stdout, stderr } = await exec(command)
		console.log('stdout:', stdout)
		console.error('stderr:', stderr)
	} catch (error) {
		console.error('exec error:', error)
	}
}

;(async () => {
	await wget(changeLogUrl)
	const html = fs.readFileSync('index.html', 'utf8')
	const $ = cheerio.load(html)

	$('head').append(
		'<style>.elementor-popup-modal {display: none !important;}</style>'
	)

	//get [data-widget_type="theme-post-content.default"] and remove all h4 and ul and p
	$('.elementor-widget-theme-post-content h4').remove()
	$('.elementor-widget-theme-post-content ul').remove()
	$('.elementor-widget-theme-post-content p').remove()

    const gitConventionalCommitsPrefixes = [
        'Internal:',
        'Bugfix:',
        'Tweak:',
        'Fix:',
        'New:',
        'Feature:',
        'Enhancement:',
        'Breaking:',
        'Documentation:',
        'Build:',
        'Chore:',
        'CI:',
        'Tests:'
    ];

    //split to array  - on every git commit prefix 
    const changeLogLines = changeLog.split(new RegExp(`(${gitConventionalCommitsPrefixes.join('|')})`));

	const $ul = $('<ul></ul>')
	changeLogLines.forEach(line => {
		$ul.append(`<li>${line}</li>`)
	})

	const currentDate = new Date().toISOString().split('T')[0]
	const $h4 = $(`<h4>${packageVersion} - ${currentDate}</h4>`)

	$('.elementor-widget-theme-post-content').append($h4)
	$('.elementor-widget-theme-post-content').append($ul)

	await generateAndPublishChangelog(octokit, owner, repo, $.html())
})()
