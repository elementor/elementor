import HookAfter from '../base/after';
import Helper from '../helper';

export class SectionColumns extends HookAfter {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'create-section-columns';
	}

	bindContainerType() {
		return 'document';
	}

	getConditions( args ) {
		return ! args.model.elements;
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
		const { structure = false, options = {} } = args;

		if ( ! Array.isArray( containers ) ) {
			containers = [ containers ];
		}

		let { columns = 1 } = args;

		if ( args.model.isInner && 1 === columns ) {
			columns = containers[ 0 ].view.defaultInnerSectionColumns;
		}

		Helper.createSectionColumns( containers, columns, options, structure );
	}
}

export default SectionColumns;
