import { SafeCommand } from './safe-command.spec';

export class AsyncCommand extends SafeCommand {
	apply() {
		return new Promise( ( resolve ) => {
			setTimeout( () => resolve(), 0 );
		} );
	}
}
