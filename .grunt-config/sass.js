const sassImplementation = require('sass');

const sass = {
	options: {
		implementation: sassImplementation,
		sourceMap: true,
		logger: {
			warn(message) {
				// suppress all warnings
			},
			debug(message) {
				// suppress all debug logs
			}
		}
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
				src: 'editor.scss',
				dest: 'assets/css/modules/styleguide',
				ext: '.css',
			},
			{
				expand: true,
				cwd: 'modules/atomic-opt-in/assets/scss',
				src: '*.scss',
				dest: 'assets/css/modules/editor-v4-opt-in',
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
<<<<<<< HEAD
=======
				cwd: 'modules/editor-one/assets/scss',
				src: '*.scss',
				dest: 'assets/css/modules/editor-one',
				ext: '.css',
			},
			{
				expand: true,
				cwd: 'modules/home/assets/scss',
				src: 'e-home-screen.scss',
				dest: 'assets/css/modules/home',
				ext: '.css',
			},
			{
				expand: true,
>>>>>>> 3a2b6feca4 (Internal: Update Editor menu with fly-out [ED-21801] [ED-21836] [ED-21838] [ED-21903] [ED-21904] (#33689))
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
			{
				expand: true,
				cwd: 'assets/dev/scss/frontend/conditionals/with-breakpoints',
				src: '*.scss',
				dest: 'assets/css/conditionals',
				ext: '.css',
			},
			{
				expand: true,
				cwd: 'assets/dev/scss/frontend/conditionals/with-breakpoints',
				src: '*.scss',
				dest: 'assets/css/templates',
				ext: '.css',
			},
		]
	}
};

module.exports = sass;
