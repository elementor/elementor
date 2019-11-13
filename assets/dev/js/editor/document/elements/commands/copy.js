import History from '../../commands/base/history';

export class Copy extends History {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	getHistory( args ) {
		// No history required for the command.
		return false;
	}

	apply( args ) {
		const { storageKey = 'clipboard', containers = [ args.container ] } = args;

		elementorCommon.storage.set(
			storageKey,
			containers.map( ( container ) => container.model.toJSON( { copyHtmlCache: true } ) )
		);
	}
}

export default Copy;
