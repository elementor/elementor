/**
 * @typedef {import('../container/container')} Container
 */

/**
 * Grid container element helper functions.
 */
export class ContainerGridHelper {
	/**
	 * Create a Container element.
	 *
	 * @param {Object}    settings - Settings to set to each Container.
	 * @param {Container} target   - The Container object to create the new Container elements inside.
	 * @param {Object}    options  - Additional command options.
	 *
	 * @return {Container} - The newly created Container.
	 */
	static createGridContainer( settings = {}, target, options = {} ) {
		return $e.run( 'document/elements/create', {
			container: target,
			model: {
				elType: 'container',
				setting: {
					container_type: 'grid',
					...settings,
				},
			},
			options,
		} );
	}

	/**
	 * Create a Container element based on a preset.
	 *
	 * @param {string}    preset                       - Preset structure of the sub containers (e.g. `33-66-66-33`).
	 * @param {Container} target                       - The target container of the newly created Container.
	 * @param {Object}    options                      - Additional command options.
	 * @param {boolean}   [options.createWrapper=true] - Create a wrapper container for the preset.
	 *
	 * @return {Container} - Container created on.
	 */
	static createContainerFromPreset( preset, target = elementor.getPreviewContainer(), options ) {
		const historyId = $e.internal( 'document/history/start-log', {
				type: 'add',
				title: __( 'Container', 'elementor' ),
			} ),
			{ createWrapper = true } = options;

		let newContainer;

		try {
			newContainer = ContainerGridHelper.createGridContainer( {}, target, options );

			$e.internal( 'document/history/end-log', { id: historyId } );
		} catch ( e ) {
			$e.internal( 'document/history/delete-log', { id: historyId } );
		}

		return newContainer;
	}
}
