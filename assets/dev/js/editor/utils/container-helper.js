/**
 * Container element helper functions.
 */
export class ContainerHelper {
	// Flex directions.
	static DIRECTION_ROW = 'row';
	static DIRECTION_COLUMN = 'column';
	static DIRECTION_ROW_REVERSED = 'row-reverse';
	static DIRECTION_COLUMN_REVERSED = 'column-reverse';

	/**
	 * Create multiple container elements.
	 *
	 * @param {Number} count - Count of Containers to create.
	 * @param {Object} settings - Settings to set to each Container.
	 * @param {Container} target - The Container object to create the new Container elements inside.
	 * @param {Object} options - Additional command options.
	 *
	 * @return {Container[]} - Array of the newly created Containers.
	 */
	static createContainers( count, settings, target = {}, options = {} ) {
		const containers = [];

		for ( let i = 0; i < count; i++ ) {
			containers.push( this.createContainer( settings, target, options ) );
		}

		return containers;
	}

	/**
	 * Create a Container element.
	 *
	 * @param {Object} settings - Settings to set to each Container.
	 * @param {Container} target - The Container object to create the new Container elements inside.
	 * @param {Object} options - Additional command options.
	 *
	 * @return {Container} - The newly created Container.
	 */
	static createContainer( settings = {}, target, options = {} ) {
		return $e.run( 'document/elements/create', {
			container: target,
			model: {
				elType: 'container',
				settings,
			},
			options,
		} );
	}

	/**
	 * Change Container settings.
	 *
	 * @param {Object} settings - New settings.
	 * @param {Container} container - Container to set the settings to.
	 *
	 * @return {void}
	 */
	static setContainerSettings( settings, container ) {
		$e.run( 'document/elements/settings', {
			container,
			settings,
			options: {
				external: true,
			},
		} );
	}

	/**
	 * Create a Container element based on a preset.
	 *
	 * @param {string} preset - Preset structure of the sub containers (e.g. `33-66-66-33`).
	 * @param {Container} target - The target container of the newly created Container.
	 * @param {Object} options - Additional command options.
	 *
	 * @return {Container}
	 */
	static createContainerFromPreset( preset, target, options = {} ) {
		const sizes = preset.split( '-' ),
			settings = {
				flex_direction: ContainerHelper.DIRECTION_ROW,
				flex_wrap: 'wrap',
			};

		// Create a parent container to contain all of the sub containers.
		let parentContainer;

		if ( options.createForTarget ) {
			$e.run( 'document/elements/settings', {
				container: target,
				settings,
			} );

			parentContainer = target;
		} else {
			parentContainer = this.createContainer( settings, target, options );
		}

		// Create all sub containers using the sizes array.
		// Use flex basis to make the sizes explicit.
		sizes.forEach( ( size ) => {
			this.createContainer( {
				flex_direction: this.DIRECTION_COLUMN,
				width: {
					unit: '%',
					size,
				},
				width_mobile: { // For out-of-the-box responsiveness.
					unit: '%',
					size: '100',
				},
			}, parentContainer, { edit: false } );
		} );

		return parentContainer;
	}

	/**
	 * Create a Container element based on a preset, extend version to cover edge cases.
	 *
	 * @param {string} preset
	 * @param {Container} [container=elementor.getPreviewContainer()]
	 * @param {Object} [options={}]
	 *
	 * @returns {Container} - Container created on.
	 */
	static createContainerFromPresetEx( preset, container = elementor.getPreviewContainer(), options ) {
		let newContainer;

		const { createForTarget = false } = options,
			historyId = $e.internal( 'document/history/start-log', {
				type: 'add',
				title: 'Container',
			} );

		// Clear prev style.
		if ( createForTarget ) {
			$e.run( 'document/elements/reset-style', { container } );
		}

		switch ( preset ) {
			// Single Container without sub Containers.
			case '100':
				newContainer = ContainerHelper.createContainer( {}, container, options );
				break;

			// Exceptional preset.
			case 'c100-c50-50':
				let settings = {
					flex_direction: ContainerHelper.DIRECTION_ROW,
					flex_wrap: 'wrap',
				};

				if ( ! createForTarget ) {
					newContainer = ContainerHelper.createContainer( settings, container, options );
				} else {
					$e.run( 'document/elements/settings', { container, settings } );
					newContainer = container;
				}

				settings = {
					width: {
						unit: '%',
						size: '50',
					},
					width_mobile: {
						unit: '%',
						size: '100',
					},
				};

				ContainerHelper.createContainer( settings, newContainer, { edit: false } );

				// Create the right Container with 0 padding (default is 10px) to fix UI (ED-4900).
				const rightContainer = ContainerHelper.createContainer( { ...settings, padding: { size: '' } }, newContainer, { edit: false } );

				ContainerHelper.createContainers( 2, {}, rightContainer, { edit: false } );

				break;

			// Containers by preset.
			default:
				newContainer = ContainerHelper.createContainerFromPreset(
					preset,
					container,
					options
				);
				break;
		}

		$e.internal( 'document/history/end-log', { id: historyId } );

		return newContainer;
	}

	/**
	 * Open edit mode of a Container.
	 *
	 * @param {Container} container - Container to open edit mode for.
	 *
	 * @return void
	 */
	static openEditMode( container ) {
		$e.run( 'panel/editor/open', {
			model: container.model,
			view: container.view,
			container,
		} );
	}
}

export default ContainerHelper;
