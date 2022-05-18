const got = require('got');
const fs = require('fs/promises');

const GITHUB_URL = "https://api.github.com/repos/elementor/elementor/releases?per_page=100";
const CHANGELOG_HEADER = '# Elementor Developer Edition - by Elementor.com\n';
const DEV_CHANGELOG_NAME = 'DEV-CHANGELOG.md';

const currentDateString = (date) => {
    let dd = date.getDate();
    let mm = date.getMonth() + 1;

    const yyyy = date.getFullYear();
    if (dd < 10) {
        dd = `0${dd}`;
    }
    if (mm < 10) {
        mm = `0${mm}`;
    }
    return `${yyyy}-${mm}-${dd}`;
};


(async () => {
    try {
        const response = await got(GITHUB_URL, {
            responseType: "json"
        });
        const devReleases = response.body.filter(({ tag_name }) => tag_name.includes('-dev'));
        const changeLogText = devReleases.reduce((allChangelog, { body, tag_name, published_at }) => {
            if (!body) {
                return allChangelog;
            }
            const versionHeader = `#### ${tag_name.substring(1)} - ${currentDateString(new Date(published_at))}`
            allChangelog = `${allChangelog}\n${versionHeader}\n${body}\n`;
            return allChangelog;
        }, CHANGELOG_HEADER);
        await fs.writeFile(DEV_CHANGELOG_NAME, changeLogText, 'utf-8');
    } catch (error) {
        console.error(`Failed to generate developer-edition changelog`, error.message);
        process.exit(1);
    }
})()
