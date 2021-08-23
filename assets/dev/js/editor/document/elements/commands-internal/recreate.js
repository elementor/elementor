import CommandInternal from 'elementor-api/modules/command-internal-base';

export class Recreate extends CommandInternal {
	validateArgs( args = {} ) {
		this.requireArgumentType( 'models', 'object', args );
	}

	apply( { models } ) {
		Object.entries( models ).forEach( ( [ id, model ] ) => {
			const container = elementor.getContainer( id ),
				parent = container.parent,
				location = parent.children.indexOf( container );

			$e.run( 'document/elements/delete', { useHistory: false, container } );

			$e.run( 'document/elements/create', {
				useHistory: false,
				container: parent,
				model,
				options: {
					at: location,
					edit: false,
				},
			} );
		} );
	}
}

export default Recreate;
