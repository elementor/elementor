import Commands from './commands.js';

export default class CommandsInternal extends Commands {
	/**
	 * Function agreements().
	 *
	 * The return list of agreements hooks defined by unique id.
	 *
	 * Makes 'Agreements' management easy and available only for internal usage.
	 *
	 * @return {string[]}
	 */
	agreements() {
		return [
			'elementor-paste-from-clipboard',
			'elementor-copy-to-clipboard',
		];
	}

	error( message ) {
		throw Error( 'Commands internal: ' + message );
	}
}
