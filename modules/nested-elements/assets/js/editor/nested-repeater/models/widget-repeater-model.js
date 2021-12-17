/**
 * @extends {ElementModel}
 */
export default class WidgetRepeaterModel extends elementor.modules.elements.models.Element {
	defaultChildren = [];

	initialize( options ) {
		this.config = elementor.widgetsCache[ options.widgetType ];

		super.initialize( options );
	}

	getDefaultChildren() {
		// eslint-disable-next-line camelcase
		const { defaults } = this.config,
			result = [];

		defaults.elements.forEach( ( element ) => {
			element.id = elementorCommon.helpers.getUniqueId();
			element.settings = new Backbone.Model( element.settings || {} );
			element.elements = element.elements || [];

			const elementType = elementor.getElementType( element.elType, element.widgetType ),
				ModelClass = elementType.getModel();

			result.push( new ModelClass( element ) );
		} );

		return result;
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
