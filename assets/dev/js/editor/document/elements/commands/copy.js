import Base from '../../commands/base/base';

export class Copy extends Base {
	validateArgs( args ) {
		this.requireContainer( args );
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
