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

	test( 'dispatches add_element when the drop created an element', () => {
		// Arrange.
		const model = { elType: 'widget', widgetType: 'e-heading' };

		// Act.
		trackAddElement( { dropResult: { id: 'new-element' }, model } );

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
		trackAddElement( { dropResult: { id: 'new-element' }, model } );

		// Assert.
		expect( dispatchEvent ).toHaveBeenCalledWith( 'add_element', {
			location: 'editor_panel',
			element_name: 'e-flexbox',
			element_type: 'e-flexbox',
			widget_type: '',
		} );
	} );

	test.each( [
		[ 'false when a dependency hook blocked the command', false ],
		[ 'undefined when no element was created', undefined ],
		[ 'null', null ],
	] )( 'does not dispatch when the drop returned %s', ( _, dropResult ) => {
		// Arrange.
		const model = { elType: 'widget', widgetType: 'e-form-honeypot' };

		// Act.
		trackAddElement( { dropResult, model } );

		// Assert.
		expect( dispatchEvent ).not.toHaveBeenCalled();
	} );

	test( 'does nothing when the events manager is unavailable', () => {
		// Arrange.
		global.elementorCommon = {};

		// Act & Assert.
		expect( () => trackAddElement( { dropResult: { id: 'new-element' }, model: {} } ) ).not.toThrow();
	} );
} );
