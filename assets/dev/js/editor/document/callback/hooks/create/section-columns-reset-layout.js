import HookAfter from '../base/after';

export class SectionColumnsResetLayout extends HookAfter {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'section-columns-reset-layout';
	}

	getConditions( args ) {
		// On `document/elements/move` no need for reset layout.
		return args.model &&
			'column' === args.model.elType &&
			'document/elements/move' !== $e.commands.currentTrace[ 0 ];
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
			container.parent.view.resetLayout()
		);
	}
}

export default SectionColumnsResetLayout;
