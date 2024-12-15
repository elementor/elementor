
const shell = {
	git_add_all: {
		command: [
			'git add --all',
			'git commit -m "Bump to <%= pkg.version %>"'
		].join( '&&' )
	},
	packages_build: {
		command: 'pnpm run packages:install && pnpm run packages:build',
	}
};

module.exports = shell;
