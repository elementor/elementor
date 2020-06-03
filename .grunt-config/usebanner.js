/**
 * Grunt usebanner task config
 * @package Elementor
 */
module.exports = {
	dist: {
		options: {
			banner: '<%= banner %>'
		},
		files: {
			src: [
				'assets/js/*.js',
				'assets/css/*.css'
			]
		}
	}
};
