/**
 * @extends {ElementModel}
 */
export default class WidgetRepeaterModel extends elementor.modules.elements.models.Element {
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

			const elementType = elementor.getElementType( element.elType, element.widgetType ),
				ModelClass = elementType.getModel();

			this.defaultChildren.push( new ModelClass( element ) );
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
			elementor.modules.nestedElements.isWidgetSupportNesting( this.get( 'widgetType' ) );
	}
}
