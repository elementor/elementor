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

	isValidChild( childModel ) {
		const parentElType = this.get( 'elType' ),
			childElType = childModel.get( 'elType' );

		return 'container' === childElType &&
			'widget' === parentElType &&
			$e.components.get( 'nested-elements' ).isWidgetSupportNesting( this.get( 'widgetType' ) );
	}

	getDefaultChildren() {
		const { defaults } = this.config,
			result = [];

		defaults.elements.forEach( ( element ) => {
			element.id = elementorCommon.helpers.getUniqueId();
			element.settings = element.settings || {};
			element.elements = element.elements || [];

			result.push( element );
		} );

		return result;
	}

	onElementCreate() {
		this.set( 'elements', this.getDefaultChildren() );
	}
}
