import After from 'elementor-api/modules/hooks/data/after';

export class SectionColumnsResetLayout extends After {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'section-columns-reset-layout';
	}

	getContainerType() {
		return 'section';
	}

	getConditions() {
		// On `document/elements/move` do not fire the hook!.
		return ! $e.commands.isCurrentFirstTrace( 'document/elements/move' );
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

		containers.forEach( ( /**Container*/ container ) =>
			container.parent.view.resetLayout( false )
		);
	}
}

export default SectionColumnsResetLayout;
