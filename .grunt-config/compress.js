/**
 * Grunt compress task config
 * @package Elementor
 */
const compress = {
	main: {
		options: {
			archive: 'build/<%= pkg.name %>-<%= pkg.version %>.zip'
		},
		files: [
			{
				expand: true,
				cwd: 'build/',
				dest: '<%= pkg.name %>/',
				src: [
					'**'
				]
			}
		]
	}
};

module.exports = compress;