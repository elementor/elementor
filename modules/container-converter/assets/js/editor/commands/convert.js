import CommandHistory from 'elementor-document/commands/base/command-history';
import Migrator from '../migrator';

export class Convert extends CommandHistory {
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
	 * TODO: It's static in order to be able to test that without initializing the whole editor in a browser.
	 *  Should be moved to `apply()` when there is a proper way to test commands using jest.
	 *
	 * @param {Container} container - Element to convert.
	 * @param {Container} rootContainer - Root element to migrate the `container` into (used for recursion).
	 *
	 * @return {void}
	 */
	static convert( { container, rootContainer = container.parent } ) {
		const { view, type: elType } = container;

		// TODO: Maybe use `view._parent.collection.indexOf( this.model )`.
		const at = view._index;

		// Copy the element as is without converting.
		if ( ! Migrator.canConvertToContainer( elType ) ) {
			$e.run( 'document/elements/copy', { container } );
			$e.run( 'document/elements/paste', { container: rootContainer, at } );

			return;
		}

		const controlsMapping = Migrator.getLegacyControlsMapping( elType );
		let settings = container.settings.toJSON( { remove: 'default' } );

		settings = Migrator.migrate( settings, controlsMapping );
		settings = Migrator.normalizeSettings( elType, settings );

		const newContainer = $e.run( 'document/elements/create', {
			model: { elType: 'container', settings },
			container: rootContainer,
			options: { at },
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
