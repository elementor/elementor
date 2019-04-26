/**
 * Grunt watch task config
 * @package Elementor
 */
const watch = {
	styles: {
		files: [
			'**/*.scss',
			'!assets/dev/scss/frontend/breakpoints/proxy.scss'
		],
		tasks: [ 'styles:true' ],
		options: {
			spawn: false,
			livereload: true
		}
	},
};

module.exports = watch;
