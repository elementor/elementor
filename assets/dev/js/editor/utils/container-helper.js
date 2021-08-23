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
		const sizes = preset.split( '-' );

		// Create a parent container to contain all of the sub containers.
		const parentContainer = this.createContainer( {
				flex_direction: ContainerHelper.DIRECTION_ROW,
				flex_wrap: 'wrap',
			}, target, options );

		// Create all sub containers using the sizes array.
		// Use flex basis to make the sizes explicit.
		sizes.forEach( ( size ) => {
			this.createContainer( {
				flex_direction: this.DIRECTION_COLUMN,
				_flex_basis_type: 'custom',
				_flex_basis: {
					unit: '%',
					size,
				},
				_flex_basis_mobile: { // For out-of-the-box responsiveness.
					unit: '%',
					size: '100',
				},
			}, parentContainer, { edit: false } );
		} );

		return parentContainer;
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
