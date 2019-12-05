import HookAfter from '../base/after';
import Create from '../../../elements/commands/create';

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

		// TODO: Next code is duplicate, avoid this:
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

export default InnerSectionColumns;
