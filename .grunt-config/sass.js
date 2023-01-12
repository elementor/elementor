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
				src: '_swiper.scss',
				rename: () => {
					return 'assets/lib/swiper/css/swiper.css';
				}
			},
			{
				expand: true,
				cwd: 'assets/dev/scss/frontend',
				src: '_swiper8.scss',
				rename: () => {
					return 'assets/lib/swiper/v8/css/swiper.css';
				}
			}
		]
	}
};

module.exports = sass;
