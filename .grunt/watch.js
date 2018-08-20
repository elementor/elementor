/**
 * Grunt watch task config
 * @package Elementor
 * @type {{styles: {files: string[], tasks: string[], options: {spawn: boolean, livereload: boolean}}, scripts: {files: string[], tasks: string[], options: {spawn: boolean, livereload: boolean}}}}
 */
const watch = {
	styles: {
		files: [
			'assets/dev/scss/**/*.scss',
			'modules/**/*.scss',
			'!assets/dev/scss/frontend/breakpoints/proxy.scss'
		],
		tasks: [ 'styles:true' ],
		options: {
			spawn: false,
			livereload: true
		}
	},

	scripts: {
		files: [
			'assets/dev/js/**/*.js',
			'modules/**/*.js'
		],
		tasks: [ 'scripts:true' ],
		options: {
			spawn: false,
			livereload: true
		}
	}
};

module.exports = watch;