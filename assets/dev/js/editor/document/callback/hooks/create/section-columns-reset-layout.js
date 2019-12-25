import HookAfter from 'elementor-api/modules/hook-base/after';

export class SectionColumnsResetLayout extends HookAfter {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'section-columns-reset-layout';
	}

	bindContainerType() {
		return 'section';
	}

	getConditions( args ) {
		// On `document/elements/move` do not fire the hook!.
		return 'document/elements/move' !== $e.commands.getCurrentFirstTrace();
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
