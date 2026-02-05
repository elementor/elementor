import { type TransitionCategory, type TransitionProperty } from '../data';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( label: string ) => label,
} ) );

const setSiteDirection = ( isRtl: boolean ) => {
	window.elementorFrontend = {
		config: {
			is_rtl: isRtl,
		},
	};
};

const getPropertyLabel = ( categoryLabel: string, propertyValue: string ) => {
	const { transitionProperties: props } = require( '../data' );
	return props
		.find( ( cat: TransitionCategory ) => cat.label === categoryLabel )
		?.properties.find( ( prop: TransitionProperty ) => prop.value === propertyValue )?.label;
};

const getCategory = ( categoryLabel: string ) => {
	const { transitionProperties: props } = require( '../data' );
	return props.find( ( cat: TransitionCategory ) => cat.label === categoryLabel );
};

describe( 'transitionProperties RTL support', () => {
	beforeEach( () => {
		delete window.elementorFrontend;
		jest.resetModules();
	} );

	it( 'should use logical inline labels for LTR websites', () => {
		setSiteDirection( false );

		expect( getPropertyLabel( 'Margin', 'margin-inline-start' ) ).toBe( 'Margin left' );
		expect( getPropertyLabel( 'Margin', 'margin-inline-end' ) ).toBe( 'Margin right' );

		expect( getPropertyLabel( 'Padding', 'padding-inline-start' ) ).toBe( 'Padding left' );
		expect( getPropertyLabel( 'Padding', 'padding-inline-end' ) ).toBe( 'Padding right' );

		expect( getPropertyLabel( 'Position', 'inset-inline-start' ) ).toBe( 'Left' );
		expect( getPropertyLabel( 'Position', 'inset-inline-end' ) ).toBe( 'Right' );

		const positionValues = getCategory( 'Position' )?.properties.map(
			( property: TransitionProperty ) => property.value
		);
		expect( positionValues ).toEqual(
			expect.arrayContaining( [
				'inset-block-start',
				'inset-inline-start',
				'inset-inline-end',
				'inset-block-end',
				'z-index',
			] )
		);
	} );

	it( 'should flip inline labels according to RTL websites', () => {
		setSiteDirection( true );

		expect( getPropertyLabel( 'Margin', 'margin-inline-start' ) ).toBe( 'Margin right' );
		expect( getPropertyLabel( 'Margin', 'margin-inline-end' ) ).toBe( 'Margin left' );

		expect( getPropertyLabel( 'Padding', 'padding-inline-start' ) ).toBe( 'Padding right' );
		expect( getPropertyLabel( 'Padding', 'padding-inline-end' ) ).toBe( 'Padding left' );

		expect( getPropertyLabel( 'Position', 'inset-inline-start' ) ).toBe( 'Right' );
		expect( getPropertyLabel( 'Position', 'inset-inline-end' ) ).toBe( 'Left' );
	} );
} );
