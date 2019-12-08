import HookAfter from '../base/after';
import Helper from '../helper';

export class InnerSectionColumns extends HookAfter {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'create-inner-section-columns';
	}

	bindContainerType() {
		return 'column';
	}

	getConditions( args ) {
		return args.model.isInner && ! args.model.elements;
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
		const { structure = '20', options = {} } = args;

		if ( ! Array.isArray( containers ) ) {
			containers = [ containers ];
		}

		const columns = containers[ 0 ].view.defaultInnerSectionColumns;

		Helper.createSectionColumns( containers, columns, options, structure );
	}
}

export default InnerSectionColumns;
