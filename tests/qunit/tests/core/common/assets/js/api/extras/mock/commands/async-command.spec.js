import { SafeCommand } from './safe-command.spec';

export class AsyncCommand extends SafeCommand {
	apply( args = {} ) {
		return new Promise( ( resolve ) => {
			setTimeout( () => resolve(), 0 );
		} );
	}
}
