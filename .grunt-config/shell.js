/**
 *
 * @type {{git_add_all: {command: string}}}
 */
const shell = {
	git_add_all: {
		command: [
			'git add --all',
			'git commit -m "Bump to <%= pkg.version %>"'
		].join( '&&' )
	}
};

module.exports = shell;