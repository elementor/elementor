import HookAfter from '../base/after';

export class SectionColumnsResetLayout extends HookAfter {
	hook() {
		return 'document/elements/create';
	}

	id() {
		return 'section-columns-reset-layout';
	}

	conditioning( args ) {
		return args.model && 'column' === args.model.elType;
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
