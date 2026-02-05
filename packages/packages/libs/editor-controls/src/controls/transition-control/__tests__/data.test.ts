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

const setProInstalled = ( version?: string ) => {
	if ( version ) {
		window.elementorPro = {
			config: {
				version,
			},
		};
	} else {
		delete window.elementorPro;
	}
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
		delete window.elementorPro;
		jest.resetModules();
	} );

	it( 'should use logical inline labels for LTR websites', () => {
		setProInstalled( '3.35.0' );
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
		setProInstalled( '3.35.0' );
		setSiteDirection( true );

		expect( getPropertyLabel( 'Margin', 'margin-inline-start' ) ).toBe( 'Margin right' );
		expect( getPropertyLabel( 'Margin', 'margin-inline-end' ) ).toBe( 'Margin left' );

		expect( getPropertyLabel( 'Padding', 'padding-inline-start' ) ).toBe( 'Padding right' );
		expect( getPropertyLabel( 'Padding', 'padding-inline-end' ) ).toBe( 'Padding left' );

		expect( getPropertyLabel( 'Position', 'inset-inline-start' ) ).toBe( 'Right' );
		expect( getPropertyLabel( 'Position', 'inset-inline-end' ) ).toBe( 'Left' );
	} );
} );

describe( 'transitionProperties Pro version handling', () => {
	beforeEach( () => {
		delete window.elementorFrontend;
		delete window.elementorPro;
		jest.resetModules();
	} );

	const getTransitionProperties = () => {
		const { transitionProperties: props } = require( '../data' );
		return props;
	};

	it( 'should show only Default category when Pro is not installed', () => {
		setProInstalled();

		const props = getTransitionProperties();

		expect( props ).toHaveLength( 1 );
		expect( props[ 0 ].label ).toBe( 'Default' );
		expect( props[ 0 ].properties ).toHaveLength( 1 );
		expect( props[ 0 ].properties[ 0 ].value ).toBe( 'all' );
	} );

	it( 'should show only Default category when Pro version is below 3.35', () => {
		setProInstalled( '3.34.0' );

		const props = getTransitionProperties();

		expect( props ).toHaveLength( 1 );
		expect( props[ 0 ].label ).toBe( 'Default' );
	} );

	it( 'should show all categories when Pro version is 3.35 or higher', () => {
		setProInstalled( '3.35.0' );

		const props = getTransitionProperties();

		expect( props.length ).toBeGreaterThan( 1 );
		expect( props.map( ( cat: TransitionCategory ) => cat.label ) ).toEqual(
			expect.arrayContaining( [ 'Default', 'Margin', 'Padding', 'Flex', 'Size', 'Position', 'Typography', 'Background', 'Border', 'Effects' ] )
		);
	} );

	it( 'should show only Default category when Pro is installed but version is undefined', () => {
		window.elementorPro = {
			config: {},
		};

		const props = getTransitionProperties();

		expect( props ).toHaveLength( 1 );
		expect( props[ 0 ].label ).toBe( 'Default' );
	} );
} );
