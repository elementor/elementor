import HookAfter from '../base/after';
import Create from '../../../elements/commands/create';

export class SectionColumns extends HookAfter {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'create-section-columns';
	}

	getConditions( args ) {
		return args.model && 'section' === args.model.elType && ! args.model.elements;
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

		containers.forEach( ( /**Container*/ container ) => {
			for ( let loopIndex = 0; loopIndex < columns; loopIndex++ ) {
				const model = {
					id: elementor.helpers.getUniqueID(),
					elType: 'column',
					settings: {},
					elements: [],
				};

				/**
				 * TODO: Try improve performance of using 'document/elements/create` instead of manual create.
				 */
				container.view.addChildModel( model, options );

				/**
				 * Manual history & not using of `$e.run('document/elements/create')`
				 * For performance reasons.
				 */
				$e.run( 'document/history/log-sub-item', {
					container,
					type: 'sub-add',
					restore: Create.restore,
					options,
					data: {
						containerToRestore: container,
						modelToRestore: model,
					},
				} );
			}
		} );

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
