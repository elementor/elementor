export default class BackwardsCompatibility {
	constructor() {
		elementorCommon.elements.$window.on( 'elementor:init', this.deprecatedEvents );

		elementor.channels.data
		.on( 'template:before:insert', this.startInsertTemplate )
		.on( 'template:after:insert', this.endItem );
	}

	deprecatedEvents() {
		const elementorDataEvents = elementor.channels.data._events,
			deprecatedEvents = [
				'drag:before:update',
				'drag:after:update',

				'element:before:add',
				'element:after:add',

				'element:before:remove',
				'element:after:remove',

				'element:before:paste:style',
				'element:after:paste:style',

				'element:before:reset:style',
				'element:after:reset:style',

				'section:before:drop',
				'section:after:drop',
		];

		deprecatedEvents.forEach( ( event ) => {
			if ( elementorDataEvents[ event ] && elementorDataEvents[ event ].length ) {
				elementorCommon.helpers.softDeprecated( `event: ${ event }`, '2.8.0', '$e.hooks' );
			}
		} );
	}

	startInsertTemplate( model ) {
		elementorCommon.helpers.softDeprecated( 'event: template:before:insert', '2.8.0', "$e.run( 'document/import' )" );

		elementor.documents.getCurrent().history.startItem( {
				type: 'add',
				title: __( 'Template', 'elementor' ),
				subTitle: model.get( 'title' ),
				elementType: 'template',
		} );
	}

	endItem() {
		elementor.documents.getCurrent().history.endItem();
	}
}
