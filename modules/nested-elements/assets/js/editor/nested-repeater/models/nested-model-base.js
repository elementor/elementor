import { isWidgetSupportNesting } from 'elementor/modules/nested-elements/assets/js/editor/utils';

export default class NestedModelBase extends elementor.modules.elements.models.Element {
	initialize( options ) {
		this.config = elementor.widgetsCache[ options.widgetType ];

		this.set( 'supportRepeaterChildren', true );

		const isNewElementCreate = 0 === this.get( 'elements' ).length &&
			$e.commands.currentTrace.includes( 'document/elements/create' );

		if ( isNewElementCreate ) {
			this.onElementCreate();
		}

		super.initialize( options );
	}

	isValidChild( childModel ) {
		const parentElType = this.get( 'elType' ),
			childElType = childModel.get( 'elType' );

		return 'container' === childElType &&
			'widget' === parentElType &&
			isWidgetSupportNesting( this.get( 'widgetType' ) ) &&
			// When creating a container for the tabs widget specifically from the repeater, the container should be locked,
			// so only containers that are locked (created from the repeater) can be inside the tabs widget.
			childModel.get( 'isLocked' );
	}

	getDefaultChildren() {
		const { defaults } = this.config,
			result = [];

		defaults.elements.forEach( ( element ) => {
			element.id = elementorCommon.helpers.getUniqueId();
			element.settings = element.settings || {};
			element.elements = element.elements || [];
			element.isLocked = true;

			result.push( element );
		} );

		return result;
	}

	onElementCreate() {
		this.set( 'elements', this.getDefaultChildren() );
	}
}
