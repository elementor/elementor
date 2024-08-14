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
				cwd: 'core/editor/loader/v2/scss',
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
				cwd: 'modules/styleguide/assets/scss',
				src: '*.scss',
				dest: 'assets/css/modules/styleguide',
				ext: '.css',
			},
			{
				expand: true,
				cwd: 'modules/ai/assets/scss',
				src: '*.scss',
				dest: 'assets/css/modules/ai',
				ext: '.css',
			},
			{
				expand: true,
				cwd: 'modules/apps/assets/scss',
				src: 'admin.scss',
				dest: 'assets/css/modules/apps',
				ext: '.css',
			},
			{
				expand: true,
				cwd: 'assets/dev/scss/frontend',
				src: 'admin-bar.scss',
				dest: 'assets/css',
				ext: '.css',
			},
			{
				expand: true,
				cwd: 'assets/dev/scss/frontend/conditionals',
				src: '*.scss',
				dest: 'assets/css/conditionals',
				ext: '.css',
			},
		]
	}
};

module.exports = sass;
