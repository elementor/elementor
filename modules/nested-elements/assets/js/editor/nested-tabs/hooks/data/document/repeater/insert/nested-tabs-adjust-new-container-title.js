import Base from 'elementor/modules/nested-elements/assets/js/editor/hooks/data/document/repeater/base';

export class NestedTabsAdjustNewContainerTitle extends Base {
	getId() {
		return 'nested-tabs-adjust-new-container-title';
	}

	getCommand() {
		return 'document/repeater/insert';
	}

	getConditions( args ) {
		return 'nested-tabs' === args.name;
	}

	/**
	 * @inheritDoc
	 *
	 * @param {{}} args
	 * @param {Backbone.Model[]} models
	 */
	apply( args, models ) {
		const {
			/**
			 * @type {Container[]}
			 */
			containers = [ args.container ],
		} = args;

		if ( ! Array.isArray( models ) ) {
			models = [ models ];
		}

		models.forEach( ( model ) => {
			// Find the container that inserted by finding the linked repeater item for each repeater model being inserted.
			containers.forEach( ( container ) => {
				const repeater = container.repeaters[ args.name ],
					linkedRepeaterContainer = repeater.children.find( ( child ) => child.id === model.get( '_id' ) ),
					index = repeater.children.indexOf( linkedRepeaterContainer );

				// When children exist.
				container.view.once( 'nested-modules:add-element:after', ( result ) => {
					// Update title of current tab according to its repeater item index.
					result.model.get( 'settings' ).set( '_title', __( 'Tab #' + ( index + 1 ) ) );
				} );
			} );
		} );
	}
}

export default NestedTabsAdjustNewContainerTitle;
