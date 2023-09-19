export default class NestedAccordionTitleKeyboardHandler extends elementorModules.frontend.handlers.NestedTitleKeyboardHandler {
	__construct( ...args ) {
		super.__construct( ...args );
		alert( 121 );
	}

	// GetDefaultSettings() {
	// 	return {
	// 		$element: this.$element,
	// 		selectors: {
	// 			itemTitle: '.e-n-accordion-item-title',
	// 			itemContainer: '.e-n-accordion-item > .e-con',
	// 		},
	// 		ariaAttributes: {
	// 			titleStateAttribute: 'aria-expanded',
	// 			activeTitleSelector: '[aria-expanded="true"]',
	// 		},
	// 		datasets: {
	// 			titleIndex: 'data-accordion-index',
	// 		},
	// 	};
	// }
	//
	// bindEvents() {
	// 	elementorFrontend.elements.$window.on( 'elementor/nested-elements/activate-by-keyboard', this.handeEnterOrSpaceEvent.bind( this ) );
	// }
	//
	// handeEnterOrSpaceEvent( event, data ) {
	// 	event.currentTarget = this.elements.$accordionTitles[ data.titleIndex - 1 ];
	// 	this.clickListener( event );
	// }
	//
	// handleContentElementEscapeEvents( event ) {
	// 	const target = event?.target;
	// }
}
