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

	/**
	 * Get an array of Container objects, and sort them by their `_flex_order` setting.
	 *
	 * @param {Container[]} items - List of Containers to sort.
	 * @returns {Container[]} - Sorted array of Containers.
	 */
	static sortFlexItemsArray( items ) {
		const clone = [ ...items ],
			currentDeviceMode = elementorFrontend.getCurrentDeviceMode(),
			settingKey = ( 'desktop' === currentDeviceMode ) ? '_flex_order' : `_flex_order_${ currentDeviceMode }`;

		// Sort the flex items by their flex order setting.
		clone.sort( ( a, b ) => {
			const aOrder = a.settings.get( settingKey ),
				bOrder = b.settings.get( settingKey );

			if ( aOrder > bOrder ) {
				return 1;
			} else if ( bOrder > aOrder ) {
				return -1;
			}

			return 0;
		} );

		return clone;
	}

	/**
	 * Set the flex order to the newly created element & push its siblings accordingly.
	 *
	 * @param {Container} container - A newly created / moved container which caused the re-order action.
	 * @param {string|int} position - New position to insert the newly created element into.
	 */
	static reOrderFlexItems( container, position ) {
		const flexItems = Helper.sortFlexItemsArray( container.parent.children );

		// Move the triggering container to the new position.
		const index = flexItems.findIndex( ( item ) => item.id === container.id );

		// Delete the element if it already exists.
		if ( -1 !== index ) {
			flexItems.splice( index, 1 );
		}

		// Insert the element in the new position.
		flexItems.splice( position, 0, container );

		// Re order the items.
		flexItems.forEach( ( item, i ) => {
			Helper.setFlexOrder( item, i );
		} );
	}

	/**
	 * Set a new flex order settings to a container.
	 *
	 * @param {Container} container - A container to apply the new setting to.
	 * @param {string|int} position - The new position.
	 */
	static setFlexOrder( container, position ) {
		const currentDeviceMode = elementorFrontend.getCurrentDeviceMode(),
			settingKey = ( 'desktop' === currentDeviceMode ) ? '_flex_order' : `_flex_order_${ currentDeviceMode }`;

		$e.run( 'document/elements/settings', {
			container: container,
			settings: {
				[ settingKey ]: position,
			},
			options: {
				external: true,
			},
		} );
	}
}
