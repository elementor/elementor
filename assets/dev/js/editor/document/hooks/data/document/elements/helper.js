import { Create } from 'elementor-document/elements/commands';

export default class Helper {
	static createSectionColumns( containers, columns, options, structure = false ) {
		containers.forEach( ( /**Container*/ container ) => {
			for ( let loopIndex = 0; loopIndex < columns; loopIndex++ ) {
				const model = {
					id: elementorCommon.helpers.getUniqueId(),
					elType: 'column',
					settings: {},
					elements: [],
				};

				/**
				 * TODO: Try improve performance of using 'document/elements/create` instead of manual create.
				 */
				container.view.addChildModel( model );

				/**
				 * Manual history & not using of `$e.run('document/elements/create')`
				 * For performance reasons.
				 */
				$e.internal( 'document/history/log-sub-item', {
					container,
					type: 'sub-add',
					restore: Create.restore,
					options,
					data: {
						containerToRestore: container,
						modelToRestore: model,
					},
				} );
			}
		} );

		if ( structure ) {
			containers.forEach( ( /* Container */ container ) => {
				container.view.setStructure( structure, false );
			} );
		} else if ( columns ) {
			containers.forEach( ( /* Container */ container ) =>
				container.view.resetLayout()
			);

			// Focus on last container.
			containers[ containers.length - 1 ].model.trigger( 'request:edit' );
		}
	}
}
