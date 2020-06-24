import Commands from './commands.js';

export default class CommandsInternal extends Commands {
	error( message ) {
		throw Error( 'Commands internal: ' + message );
	}
}
