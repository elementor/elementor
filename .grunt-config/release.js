/**
 * Grunt release task config
 * @package Elementor
 * @type {{options: {bump: boolean, npm: boolean, commit: boolean, tagName: string, commitMessage: string, tagMessage: string}}}
 */
module.exports = {
	options: {
		bump: false,
		npm: false,
		commit: false,
		tagName: 'v<%= version %>',
		commitMessage: 'released v<%= version %>',
		tagMessage: 'Tagged as v<%= version %>'
	}
};