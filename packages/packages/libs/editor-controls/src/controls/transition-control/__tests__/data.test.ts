import { type TransitionCategory, type TransitionProperty } from '../data';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( label: string ) => label,
} ) );

declare global {
	interface Window {
		elementorFrontend?: {
			config?: {
				is_rtl?: boolean;
			};
		};
	}
}

describe( 'transitionProperties RTL support', () => {
	beforeEach( () => {
		delete window.elementorFrontend;
		jest.resetModules();
	} );

	it( 'should use logical inline labels for LTR websites', () => {
		window.elementorFrontend = {
			config: {
				is_rtl: false,
			},
		};

		const { transitionProperties: props } = require( '../data' );

		const getLabel = ( categoryLabel: string, propertyValue: string ) =>
			props
				.find( ( cat: TransitionCategory ) => cat.label === categoryLabel )
				?.properties.find( ( prop: TransitionProperty ) => prop.value === propertyValue )?.label;

		expect( getLabel( 'Margin', 'margin-inline-start' ) ).toBe( 'Margin left' );
		expect( getLabel( 'Margin', 'margin-inline-end' ) ).toBe( 'Margin right' );

		expect( getLabel( 'Padding', 'padding-inline-start' ) ).toBe( 'Padding left' );
		expect( getLabel( 'Padding', 'padding-inline-end' ) ).toBe( 'Padding right' );

		expect( getLabel( 'Position', 'inset-inline-start' ) ).toBe( 'Left' );
		expect( getLabel( 'Position', 'inset-inline-end' ) ).toBe( 'Right' );
	} );

	it( 'should flip inline labels according to RTL websites', () => {
		window.elementorFrontend = {
			config: {
				is_rtl: true,
			},
		};

		const { transitionProperties: props } = require( '../data' );

		const getLabel = ( categoryLabel: string, propertyValue: string ) =>
			props
				.find( ( cat: TransitionCategory ) => cat.label === categoryLabel )
				?.properties.find( ( prop: TransitionProperty ) => prop.value === propertyValue )?.label;

		expect( getLabel( 'Margin', 'margin-inline-start' ) ).toBe( 'Margin right' );
		expect( getLabel( 'Margin', 'margin-inline-end' ) ).toBe( 'Margin left' );

		expect( getLabel( 'Padding', 'padding-inline-start' ) ).toBe( 'Padding right' );
		expect( getLabel( 'Padding', 'padding-inline-end' ) ).toBe( 'Padding left' );

		expect( getLabel( 'Position', 'inset-inline-start' ) ).toBe( 'Right' );
		expect( getLabel( 'Position', 'inset-inline-end' ) ).toBe( 'Left' );
	} );
} );
