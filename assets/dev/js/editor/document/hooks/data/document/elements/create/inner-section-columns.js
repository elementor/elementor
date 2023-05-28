import After from 'elementor-api/modules/hooks/data/after';
import Helper from '../helper';
import { DEFAULT_INNER_SECTION_COLUMNS } from 'elementor-elements/views/section';

/**
 * @typedef {import('../../../../../../container/container')} Container
 */
export class InnerSectionColumns extends After {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'create-inner-section-columns';
	}

	getContainerType() {
		return 'column';
	}

	getConditions( args ) {
		return args.model.isInner && ! args.model.elements;
	}

	/**
	 * @inheritDoc
	 *
	 * @param {{}}                         args
	 * @param {Container|Array<Container>} containers
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
