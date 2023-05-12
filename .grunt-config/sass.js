const sassImplementation = require('sass');

const sass = {
	options: {
		implementation: sassImplementation,
		sourceMap: true,
	},
	dist: {
		files: [
			{
				expand: true,
				cwd: 'assets/dev/scss/direction',
				src: '*.scss',
				dest: 'assets/css',
				ext: '.css'
			},
			{
				expand: true,
				cwd: 'core/editor/assets/scss',
				src: '*.scss',
				dest: 'assets/css',
				ext: '.css'
			},
			{
				expand: true,
				cwd: 'modules/container-converter/assets/scss',
				src: 'editor.scss',
				dest: 'assets/css/modules/container-converter',
				ext: '.css',
			},
			{
				expand: true,
				cwd: 'modules/notes/assets/scss',
				src: 'editor.scss',
				dest: 'assets/css/modules/notes',
				ext: '.css',
			},
			{
				expand: true,
				cwd: 'modules/lazyload/assets/scss',
				src: 'frontend.scss',
				dest: 'assets/css/modules/lazyload',
				ext: '.css',
			},
			{
				expand: true,
				cwd: 'assets/dev/scss/frontend',
				src: 'swiper.scss',
				dest: 'assets/lib/swiper/css',
				ext: '.css',
			},
			{
				expand: true,
				cwd: 'modules/announcements/assets/scss',
				src: 'announcements.scss',
				dest: 'assets/css/modules/announcements',
				ext: '.css',
			},
			{
				expand: true,
				cwd: 'modules/ai/assets/scss',
				src: 'editor.scss',
				dest: 'assets/css/modules/ai',
				ext: '.css',
			},
		]
	}
};

module.exports = sass;
