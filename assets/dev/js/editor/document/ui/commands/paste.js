export class Paste extends $e.modules.CommandBase {
	getPasteData( { storageType = 'localstorage', data = '' } ) {
		if ( 'localstorage' === storageType ) {
			return elementorCommon.storage.get( 'clipboard' ) || {};
		}

		try {
			return JSON.parse( data ) || {};
		} catch ( e ) {
			return {};
		}
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		this.storage = this.getPasteData( args );
		if ( ! this.storage || ! this.storage?.elements?.length || 'elementor' !== this.storage?.type ) {
			return false;
		}

		this.storage.elements = this.storage.elements.map( ( model ) =>
			new Backbone.Model( model ),
		);

		if ( ! containers[ 0 ] ) {
			this.target = elementor.getCurrentElement();
			this.target = this.target ? [ this.target.getContainer() ] : null;
		} else {
			this.target = containers;
		}

		if ( ! this.target || 0 === this.storage.elements.length ) {
			return false;
		}

		const result = [];

		this.target.forEach( ( /* Container */ container ) => {
			const { options = {} } = args,
				pasteOptions = $e.components.get( 'document/elements' ).utils.getPasteOptions( this.storage.elements[ 0 ], container );

			if ( ! pasteOptions.isValidChild ) {
				if ( pasteOptions.isSameElement ) {
					options.at = container.parent.model.get( 'elements' ).findIndex( container.model ) + 1;

					// For same element always paste on his parent.
					container = container.parent;
				} else if ( pasteOptions.isValidGrandChild ) {
					options.rebuild = true;
				}
			}

			if ( Object.values( pasteOptions ).some( ( opt ) => !! opt ) ) {
				const commandArgs = { container };

				if ( undefined !== options.rebuild ) {
					commandArgs.rebuild = options.rebuild;
				}

				if ( undefined !== options.at ) {
					commandArgs.at = options.at;
				}

				commandArgs.storageType = args.storageType || 'localstorage';

				if ( undefined !== args.data ) {
					commandArgs.data = args.data;
				}

				result.push( $e.run( 'document/elements/paste', commandArgs ) );
			}
		} );

		if ( 0 === result.length ) {
			return false;
		} else if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}

export default Paste;
