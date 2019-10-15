import HookAfter from '../../../hooks/after';
import Container from '../../../../container/container';

export class SectionColumns extends HookAfter {
	hook() {
		return 'document/elements/create';
	}

	id() {
		return 'create-section-columns';
	}

	conditioning( args ) {
		return ! args.model || 'section' !== args.model.elType || args.model.elements;
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
		const { structure = false, options = {} } = args;

		if ( ! Array.isArray( containers ) ) {
			containers = [ containers ];
		}

		let { columns = 1 } = args;

		if ( args.model.isInner && 1 === columns ) {
			columns = containers[ 0 ].view.defaultInnerSectionColumns;
		}

		for ( let loopIndex = 0; loopIndex < columns; loopIndex++ ) {
			$e.run( 'document/elements/create', {
				containers,
				options,
				model: {
					id: elementor.helpers.getUniqueID(),
					elType: 'column',
					settings: {},
					elements: [],
				},
			} );
		}

		if ( structure ) {
			containers.forEach( ( container ) => {
				container.view.setStructure( structure );

				// Focus on last container.
				container.model.trigger( 'request:edit' );
			} );
		}
	}
}

export default SectionColumns;
