import After from 'elementor-api/modules/hooks/data/after';

/**
 * @typedef {import('../../../../../../container/container')} Container
 */
export default class ResetLayoutBase extends After {
	getConditions() {
		// On `document/elements/move` do not fire the hook!.
		return ! $e.commands.isCurrentFirstTrace( 'document/elements/move' );
	}

	/**
	 * @inheritDoc
	 *
	 * @param {{}}                         args
	 * @param {Container|Array<Container>} containers
	 */
	apply( args, containers ) {
		if ( ! Array.isArray( containers ) ) {
			containers = [ containers ];
		}

		containers.forEach( ( /** Container*/ container ) =>
			container.parent.view.resetLayout( false ),
		);
	}
}
