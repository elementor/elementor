export default {
	elements: {
		window,
		// Shortcut bind, in other words make shortcuts listen to iframe.
		$window: jQuery( '#elementor-preview-iframe' ),
		$body: jQuery( '#elementor-test' ),
	},
	config: { elements: { data: {}, editSettings: {} }, breakpoints: {} },
	isEditMode: () => {},
	elementsHandler: {
		runReadyTrigger: () => {},
	},
	init: () => console.log( 'elementorFrontend::init' ), // eslint-disable-line no-console
};
