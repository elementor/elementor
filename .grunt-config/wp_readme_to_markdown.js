/**
 * @type {{github: {options: {wordpressPluginSlug: string, travisUrlRepo: string, gruntDependencyStatusUrl: string, coverallsRepo: string, screenshot_url: string}, files: {"README.md": string}}}}
 */
module.exports = {
	github: {
		options: {
			wordpressPluginSlug: 'elementor',
			travisUrlRepo: 'https://travis-ci.org/pojome/elementor',
			gruntDependencyStatusUrl: 'https://david-dm.org/pojome/elementor',
			coverallsRepo: 'pojome/elementor',
			screenshot_url: 'assets/{screenshot}.png'
		},
		files: {
			'README.md': 'readme.txt'
		}
	}
};