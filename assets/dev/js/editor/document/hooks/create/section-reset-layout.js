import HookAfter from '../base/after';

export class SectionResetLayout extends HookAfter {
	hook() {
		return 'document/elements/create';
	}

	id() {
		return 'section-reset-layout';
	}

	conditioning( args ) {
		return ! args.model || 'column' !== args.model.elType;
	}

	/**
	 * @inheritDoc
	 *
	 * @param {{}} args
	 * @param {Container||Container[]} containers
	 *
	 * @returns {Boolean}
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

export default SectionResetLayout;
