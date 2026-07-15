import isFormFieldWidgetType from 'elementor/assets/dev/js/editor/utils/is-form-field-widget-type';

describe( 'isFormFieldWidgetType', () => {
	it.each( [
		'e-form-input',
		'e-form-label',
		'e-form-checkbox',
		'e-form-submit-button',
		'e-form-select',
		'e-form-radio-button',
		'e-form-fieldset',
		'e-form-',
	] )( 'returns true for the `e-form-*` widgetType %p', ( widgetType ) => {
		expect( isFormFieldWidgetType( widgetType ) ).toBe( true );
	} );

	it.each( [
		[ 'string with a different prefix', 'e-heading' ],
		[ 'the form container itself', 'e-form' ],
		[ 'a legacy widget name', 'text-editor' ],
		[ 'an empty string', '' ],
	] )( 'returns false for %s', ( _, widgetType ) => {
		expect( isFormFieldWidgetType( widgetType ) ).toBe( false );
	} );

	it.each( [
		[ 'undefined', undefined ],
		[ 'null', null ],
		[ 'a number', 42 ],
		[ 'a boolean', true ],
		[ 'a plain object', {} ],
		[ 'a prop-shaped object', { $$type: 'string', value: 'e-form-input' } ],
		[ 'an array', [ 'e-form-input' ] ],
	] )( 'returns false without throwing for non-string %s', ( _, widgetType ) => {
		expect( () => isFormFieldWidgetType( widgetType ) ).not.toThrow();
		expect( isFormFieldWidgetType( widgetType ) ).toBe( false );
	} );
} );
