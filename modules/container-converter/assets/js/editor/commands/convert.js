import Migrator from '../migrator';

/**
 * @typedef {import('../../../../../../assets/dev/js/editor/container/container')} Container
 */
export class Convert extends $e.modules.editor.document.CommandHistoryBase {
	getHistory() {
		return {
			type: __( 'Converted to Container', 'elementor' ),
			title: __( 'Section', 'elementor' ),
		};
	}

	validateArgs( args = {} ) {
		this.requireContainer( args );
	}

	apply( args ) {
		this.constructor.convert( args );
	}

	/**
	 * Convert an element to Container.
	 *
	 * TODO: It's static in order to be able to test it without initializing the whole editor in a browser.
	 *  Should be moved to `apply()` when there is a proper way to test commands using jest.
	 *
	 * @param {Object}    root0
	 * @param {Container} root0.container     - Element to convert.
	 * @param {Container} root0.rootContainer - Root element to migrate the `container` into (used for recursion).
	 *
	 * @return {void}
	 */
	static convert( { container, rootContainer = container.parent } ) {
		const { view, type: elType } = container,
			isFirst = ( rootContainer === container.parent );

		// TODO: Maybe use `view._parent.collection.indexOf( this.model )`.
		// Get the converted element index. The first converted element should be put after the original one.
		const at = isFirst ? view._index + 1 : view._index;

		// Copy the element as is without converting.
		if ( ! Migrator.canConvertToContainer( elType ) ) {
			$e.run( 'document/elements/create', {
				model: {
					elType: container.model.get( 'elType' ),
					widgetType: container.model.get( 'widgetType' ),
					settings: container.settings.toJSON( { remove: 'default' } ),
				},
				container: rootContainer,
				options: {
					at,
					edit: false,
				},
			} );

			return;
		}

		const model = container.model.toJSON();

		const controlsMapping = Migrator.getLegacyControlsMapping( model );
		let settings = container.settings.toJSON( { remove: 'default' } );

		settings = Migrator.migrate( settings, controlsMapping );
		settings = Migrator.normalizeSettings( model, settings );

		const newContainer = $e.run( 'document/elements/create', {
			model: { elType: 'container', settings },
			container: rootContainer,
			options: {
				at,
				edit: false,
			},
		} );

		// Recursively convert children to Containers.
		container.children.forEach( ( child ) => {
			$e.run( 'container-converter/convert', {
				container: child,
				rootContainer: newContainer,
			} );
		} );
	}
}
