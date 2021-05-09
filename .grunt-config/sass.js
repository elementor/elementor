const sass = {
	dist: {
		options: {
			sourcemap: true,
			sourceMap: true
		},
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
				cwd: 'modules/admin-top-bar/assets/scss',
				src: '*.scss',
				dest: 'assets/css/modules/admin-top-bar',
				ext: '.css',
			},
		]
	}
};

module.exports = sass;
