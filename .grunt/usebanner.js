/**
 * Grunt usebanner task config
 * @package Elementor
 * @type {{dist: {options: {banner: string}, files: {src: string[]}}}}
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