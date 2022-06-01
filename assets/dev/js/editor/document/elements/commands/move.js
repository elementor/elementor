export class Move extends $e.modules.editor.document.CommandHistoryBase {
	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentInstance( 'target', elementorModules.editor.Container, args );
	}

	getHistory( args ) {
		const { containers = [ args.container ] } = args;

		return {
			containers,
			type: 'move',
		};
	}

	apply( args ) {
		const { target, options = {}, containers = [ args.container ] } = args,
			reCreate = [];

		containers.forEach( ( container ) => {
			reCreate.push( container.model.toJSON() );

			$e.run( 'document/elements/delete', { container } );
		} );

		let count = 0;
		reCreate.forEach( ( model ) => {
			// If multiple fix position.
			if ( options.hasOwnProperty( 'at' ) && reCreate.length > 1 ) {
				if ( 0 !== count ) {
					options.at += count;
				}
			}

			$e.run( 'document/elements/create', {
				container: target,
				model,
				options,
			} );

			count++;
		} );
	}
}

export default Move;
