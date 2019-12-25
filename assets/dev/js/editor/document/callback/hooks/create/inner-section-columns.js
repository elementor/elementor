import HookAfter from 'elementor-api/modules/hook-base/after';
import Helper from '../helper';
import { DEFAULT_INNER_SECTION_COLUMNS } from 'elementor-elements/views/section';

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

		Helper.createSectionColumns( containers, DEFAULT_INNER_SECTION_COLUMNS, options, structure );
	}
}

export default InnerSectionColumns;
