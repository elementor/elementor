const cheerio = require('cheerio');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const { Octokit } = require('octokit')
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });


const {
    changeLog : CHANGELOG_CONTENT,
    owner : OWNER,
    repo : REPO,
    changeLogUrl : TEMPLATE_URL,
    version : PACKAGE_VERSION
} = process.env;

async function publishToGithubPages(octokit, owner, repo, path, message, htmlContent) {
    const contentEncoded = Buffer.from(htmlContent, 'utf8').toString('base64');
    try {
        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message,
            content: contentEncoded,
            branch: 'gh-pages', // Assuming you're using the gh-pages branch for GitHub Pages
        });
    } catch (error) {
        console.error('Failed to publish to GitHub Pages:', error);
    }
  }
  
  async function generateAndPublishChangelog(octokit, owner, repo, changelog) {
    const htmlContent = generateHTML(changelog);
    await publishToGithubPages(octokit, owner, 'elementor-cloud-changelog', 'index.html', 'Update changelog', htmlContent);
  }

async function wget(url) {
    const command = `wget --no-check-certificate -e robots=off -P . ${url}`;

    try {
        const { stdout, stderr } = await exec(command);
        console.log('stdout:', stdout);
        console.error('stderr:', stderr);
    } catch (error) {
        console.error('exec error:', error);
    }
}

(async () => {
    
    await wget(changeLogUrl);
    const html = fs.readFileSync('index.html', 'utf8');
    const $ = cheerio.load(html);

    $('head').append('<style>.elementor-popup-modal {display: none !important;}</style>');

    //get [data-widget_type="theme-post-content.default"] and remove all h4 and ul and p
    $('.elementor-widget-theme-post-content h4').remove();
    $('.elementor-widget-theme-post-content ul').remove();
    $('.elementor-widget-theme-post-content p').remove();

    //for each line in changeLog add a new li
    const changeLogLines = CHANGELOG_CONTENT.split('\n');
    const $ul = $('<ul></ul>');
    changeLogLines.forEach(line => {
        $ul.append(`<li>${line}</li>`);
    });

    const currentDate = new Date().toISOString().split('T')[0];
    const $h4 = $(`<h4>${PACKAGE_VERSION} - ${currentDate}</h4>`);

    $('.elementor-widget-theme-post-content').append($h4);
    $('.elementor-widget-theme-post-content').append($ul);

    await generateAndPublishChangelog(octokit, owner, repo, $.html() );


})();
