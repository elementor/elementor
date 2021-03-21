import After from 'elementor-api/modules/hooks/data/after';

export class CreateColumnSectionEmpty extends After {
	getCommand() {
		return 'document/elements/delete';
	}

	getId() {
		return 'create-column-section-empty--document/elements/delete';
	}

	getContainerType() {
		return 'column';
	}

	getConditions( args = {} ) {
		const { containers = [ args.container ] } = args;

		return containers.some( ( container ) => 0 === container.parent.children.length );
	}

	/**
	 * @inheritDoc
	 *
	 * @param {{}} args
	 * @param {Container||Container[]} containers
	 *
	 * @returns {boolean}
	 */
	apply( args, containers ) {
		if ( ! Array.isArray( containers ) ) {
			containers = [ containers ];
		}

		containers.forEach( ( /**Container*/ container ) => {
			const parent = container.parent;

			// If deleted the last column, should recreate it.
			if ( 0 === parent.children.length ) {
				$e.run( 'document/elements/create', {
					container: parent,
					model: {
						elType: 'column',
					},
				} );
			}
		} );
	}
}

export default CreateColumnSectionEmpty;

