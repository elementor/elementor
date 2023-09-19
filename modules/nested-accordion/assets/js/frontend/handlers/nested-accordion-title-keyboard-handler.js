import NestedTitleKeyboardHandler from 'elementor-assets-js/frontend/handlers/accessibility/nested-title-keyboard-handler';

export default class NestedAccordionTitleKeyboardHandler extends NestedTitleKeyboardHandler {
	__construct( ...args ) {
		super.__construct( ...args );
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
}
