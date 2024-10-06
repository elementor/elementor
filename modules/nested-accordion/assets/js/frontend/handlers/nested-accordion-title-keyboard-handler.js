import NestedTitleKeyboardHandler
	from 'elementor-frontend/handlers/accessibility/nested-title-keyboard-handler';

export default class NestedAccordionTitleKeyboardHandler extends NestedTitleKeyboardHandler {
	__construct( ...args ) {
		super.__construct( ...args );
		const config = args[ 0 ];
		this.toggleTitle = config.toggleTitle;
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

	handeTitleLinkEnterOrSpaceEvent( event ) {
		this.toggleTitle( event );
	}

	handleContentElementEscapeEvents( event ) {
		this.getActiveTitleElement().trigger( 'focus' );
		this.toggleTitle( event );
	}

	handleTitleEscapeKeyEvents( event ) {
		const detailsNode = event?.currentTarget?.parentElement,
			isOpen = detailsNode?.open;

		if ( isOpen ) {
			this.toggleTitle( event );
		}
	}
}
