import { trackAddElement } from 'elementor-panel/pages/elements/utils/track-add-element';

describe( 'trackAddElement', () => {
	let dispatchEvent;

	beforeEach( () => {
		dispatchEvent = jest.fn();

		global.elementorCommon = { eventsManager: { dispatchEvent } };
	} );

	afterEach( () => {
		delete global.elementorCommon;
	} );

	test( 'dispatches add_element with the widget type as the name for widgets', () => {
		// Arrange.
		const model = { elType: 'widget', widgetType: 'e-heading' };

		// Act.
		trackAddElement( model );

		// Assert.
		expect( dispatchEvent ).toHaveBeenCalledWith( 'add_element', {
			location: 'editor_panel',
			element_name: 'e-heading',
			element_type: 'widget',
			widget_type: 'e-heading',
		} );
	} );

	test( 'uses the element type as the name for containers', () => {
		// Arrange.
		const model = { elType: 'e-flexbox' };

		// Act.
		trackAddElement( model );

		// Assert.
		expect( dispatchEvent ).toHaveBeenCalledWith( 'add_element', {
			location: 'editor_panel',
			element_name: 'e-flexbox',
			element_type: 'e-flexbox',
			widget_type: '',
		} );
	} );

	test( 'sends empty values when the model is missing', () => {
		// Act.
		trackAddElement( undefined );

		// Assert.
		expect( dispatchEvent ).toHaveBeenCalledWith( 'add_element', {
			location: 'editor_panel',
			element_name: '',
			element_type: '',
			widget_type: '',
		} );
	} );

	test( 'does nothing when the events manager is unavailable', () => {
		// Arrange.
		global.elementorCommon = {};

		// Act & Assert.
		expect( () => trackAddElement( {} ) ).not.toThrow();
	} );
} );
