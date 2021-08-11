import CommandInternal from 'elementor-api/modules/command-internal-base';

export class Recreate extends CommandInternal {
	validateArgs( args = {} ) {
		this.requireArgumentType( 'models', 'object', args );
	}

	apply( { models } ) {
		this.isHistoryActive = elementor.documents.getCurrent().history.getActive();

		this.disableHistory();

		Object.entries( models ).forEach( ( [ id, model ] ) => {
			const container = elementor.getContainer( id );

			const parent = container.parent;
			const location = parent.children.indexOf( container );

			$e.run( 'document/elements/delete', { container } );

			$e.run( 'document/elements/create', {
				container: parent,
				model,
				options: {
					at: location,
					edit: false,
				},
			} );
		} );

		this.resetHistory();
	}

	disableHistory() {
		elementor.documents.getCurrent().history.setActive( false );
	}

	resetHistory() {
		elementor.documents.getCurrent().history.setActive( this.isHistoryActive );
	}
}

export default Recreate;
