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
		]
	}
};

module.exports = sass;
