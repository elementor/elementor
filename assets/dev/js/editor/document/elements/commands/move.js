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
		const result = [];
		reCreate.forEach( ( model ) => {
			// If multiple fix position.
			if ( Object.prototype.hasOwnProperty.call( options, 'at' ) && reCreate.length > 1 ) {
				if ( 0 !== count ) {
					options.at += count;
				}
			}

			const newContainer = $e.run( 'document/elements/create', {
				container: target,
				model,
				options,
			} );

			result.push( newContainer );

			count++;
		} );

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}

export default Move;
