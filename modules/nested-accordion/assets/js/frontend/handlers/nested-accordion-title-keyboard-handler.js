import NestedTitleKeyboardHandler
	from '../../../../../../assets/dev/js/frontend/handlers/accessibility/nested-title-keyboard-handler';

export default class NestedAccordionTitleKeyboardHandler extends NestedTitleKeyboardHandler {
	__construct( ...args ) {
		super.__construct( ...args );
		const DTO = args[ 0 ];
		this.toggleTitle = DTO.toggleTitle;
		alert( 'NestedAccordionTitleKeyboardHandler' );
	}

	getDefaultSettings() {
		const parentSettings = super.getDefaultSettings();

		return {
			...parentSettings,
			selectors: {
				itemTitle: '.e-n-accordion-item-title',
				itemContainer: '.e-n-accordion-item > .e-con',
			},
			ariaAttributes: {
				titleStateAttribute: 'aria-expanded',
				activeTitleSelector: '[aria-expanded="true"]',
			},
			datasets: {
				titleIndex: 'data-accordion-index',
			},
		};
	}

	bindEvents() {
		super.bindEvents();
		elementorFrontend.elements.$window.on( 'elementor/nested-elements/activate-by-keyboard', this.handeEnterOrSpaceEvent.bind( this ) );
	}

	handeEnterOrSpaceEvent( event, data ) {
		event.currentTarget = this.elements.$itemTitles[ data.titleIndex - 1 ];
		this.toggleTitle( event );
	}

	handleContentElementEscapeEvents( event ) {
		this.getActiveTitleElement().trigger( 'focus' );
		this.toggleTitle( event );
	}

	handleTitleEscapeKeyEvents( event ) {
		const detailsNode = event?.currentTarget.parentElement,
			isOpen = detailsNode?.open;

		if ( isOpen ) {
			this.toggleTitle( event );
		}
	}
}
