
const shell = {
	git_add_all: {
		command: [
			'git add --all',
			'git commit -m "Bump to <%= pkg.version %>"'
		].join( '&&' )
	},
	packages_build: {
		command: 'npm run packages:install && npm run packages:build',
	}
};

module.exports = shell;
