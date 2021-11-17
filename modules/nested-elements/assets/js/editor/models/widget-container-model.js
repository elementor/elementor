const ElementModel = require( 'elementor-elements/models/element' );

export default class WidgetContainerModel extends ElementModel {
	initialize( options ) {
		this.config = elementor.widgetsCache[ options.widgetType ];

		if ( $e.commands.isCurrentFirstTrace( 'document/elements/create' ) ) {
			this.onElementCreate();
		}

		super.initialize( options );
	}

	addDefaultChildren( data ) {
		this.defaultChildren = [];

		data.forEach( ( element ) => {
			element.id = elementorCommon.helpers.getUniqueId();
			element.settings = new Backbone.Model( element.settings || {} );
			element.elements = element.elements || [];

			this.defaultChildren.push( new ElementModel( element ) );
		} );
	}

	onElementCreate() {
		// eslint-disable-next-line camelcase
		const { default_children } = this.config;

		// eslint-disable-next-line camelcase
		if ( default_children ) {
			this.addDefaultChildren( default_children );
		}
	}

	isValidChild( childModel ) {
		const parentElType = this.get( 'elType' ),
			draggedElType = childModel.get( 'elType' );

		// Support import library.
		if ( 'section' === draggedElType && 'container' === parentElType ) {
			return true;
		}

		return 'container' === draggedElType &&
			'widget' === parentElType &&
			this.isWidgetSupportNesting( parentModel.get( 'widgetType' ) );
	}
}
