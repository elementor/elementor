import CommandInternal from 'elementor-api/modules/command-internal-base';

export class Recreate extends CommandInternal {
	validateArgs( args = {} ) {
		this.requireArgumentType( 'models', 'object', args );
	}

	async apply( { models } ) {
		const currentElement = elementor.getCurrentElement(),
			isCurrentElementIsEditable = !! currentElement?.model?.get( 'elType' ),
			currentElementId = currentElement?.model?.get( 'id' );

		const recreatePromises = Object.entries( models ).map(
			( [ id, model ] ) => this.recreateElement( id, model )
		);

		await Promise.all( recreatePromises );

		if ( isCurrentElementIsEditable && currentElementId ) {
			this.openLastEditedElementPanel(
				elementor.getContainer( currentElementId )
			);
		}
	}

	recreateElement( id, model ) {
		return new Promise( ( resolve ) => {
			const container = elementor.getContainer( id ),
				parent = container.parent,
				location = parent.children.indexOf( container );

			$e.run( 'document/elements/delete', { useHistory: false, container } );

			const newContainer = $e.run( 'document/elements/create', {
				useHistory: false,
				container: parent,
				model,
				options: {
					at: location,
					edit: false,
				},
			} );

			newContainer.view.once( 'render:after', resolve );
		} );
	}

	openLastEditedElementPanel( container ) {
		$e.run( 'panel/editor/open', {
			view: container.view,
			model: container.model,
		} );

		container.view.el.scrollIntoView( {
			behavior: 'auto',
			block: 'center',
		} );
	}
}

export default Recreate;
