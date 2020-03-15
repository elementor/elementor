import Commands from './commands.js';

export default class CommandsInternal extends Commands {
	getModuleName() {
		return 'commandsInternal';
	}

	error( message ) {
		throw Error( 'Commands internal: ' + message );
	}
}
