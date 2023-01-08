import { render } from 'test-utils';
import { createI18n, I18n, useI18n } from '../';

describe( '@elementor/react-i18n', () => {
	let esI18n: I18n;

	beforeAll( () => {
		esI18n = createI18n( {
			locale: 'es_ES',
			sources: {
				es_ES: [
					{
						domain: 'elementor',
						type: 'jed-object',
						data: {
							'': {
								domain: 'elementor',
								lang: 'es_ES',
								'plural-forms': 'nplurals=2; plural=(n != 1);',
							},
							'Hello world': [ 'Hola Mundo' ],
							'Hello you': [ 'Hola tú', 'Hola a todos' ],
						},
					},
					{
						domain: 'elementor',
						type: 'jed-object',
						data: {
							'': {
								domain: 'elementor',
								lang: 'es_ES',
								'plural-forms': 'nplurals=2; plural=(n != 1);',
							},
							'Key from another source': [ 'Clave de otra fuente' ],
						},
					},
				],
			},
		} );
	} );

	it( 'should translate string based on provided key', () => {
		// Arrange
		const Component = () => {
			const { __ } = useI18n();

			return (
				<>
					<div>{ __( 'Hello world', 'elementor' ) }</div>
					<div>{ __( 'Key from another source', 'elementor' ) }</div>
				</>
			);
		};

		// Act
		const { getByText } = render( <Component />, { i18n: esI18n } );

		// Assert
		expect( getByText( 'Hola Mundo' ) ).toBeTruthy();
		expect( getByText( 'Clave de otra fuente' ) ).toBeTruthy();
	} );

	it( 'should fallback to key when translation not exists', function() {
		// Arrange
		const Component = () => {
			const { __ } = useI18n();

			return (
				<div>{ __( 'Some key', 'elementor' ) }</div>
			);
		};

		// Act
		const { getByText } = render( <Component />, { i18n: esI18n } );

		// Assert
		expect( getByText( 'Some key' ) ).toBeTruthy();
	} );

	it( 'should translate string based on the counter', () => {
		// Arrange
		const Component = () => {
			const { _n } = useI18n();

			return (
				<>
					<div data-testid="single">{ _n( 'Hello you', 'Hello all', 1, 'elementor' ) }</div>
					<div data-testid="plural">{ _n( 'Hello you', 'Hello all', 4, 'elementor' ) }</div>
				</>
			);
		};

		// Act
		const { getByTestId } = render( <Component />, { i18n: esI18n } );

		// Assert
		expect( getByTestId( 'single' ).innerHTML ).toBe( 'Hola tú' );
		expect( getByTestId( 'plural' ).innerHTML ).toBe( 'Hola a todos' );
	} );

	it( 'should return the locale and isRTL', () => {
		// Arrange
		const Component = () => {
			const { getLocale, isRTL } = useI18n();

			return (
				<>
					<div data-testid="lang">{ getLocale() }</div>
					<div data-testid="isRTL">{ isRTL() ? 'true' : 'false' }</div>
				</>
			);
		};

		// Act
		const { getByTestId } = render( <Component />, { i18n: esI18n } );

		// Assert
		expect( getByTestId( 'lang' ).innerHTML ).toBe( 'es_ES' );
		expect( getByTestId( 'isRTL' ).innerHTML ).toBe( 'false' );
	} );

	it( 'should return true when calling isRTL ', () => {
		// Arrange
		const Component = () => {
			const { isRTL } = useI18n();

			return (
				<>
					<div data-testid="isRTL">{ isRTL() ? 'true' : 'false' }</div>
				</>
			);
		};

		// Act
		const { getByTestId } = render( <Component />, { i18n: createI18n( { locale: 'he_IL' } ) } );

		// Assert
		expect( getByTestId( 'isRTL' ).innerHTML ).toBe( 'true' );
	} );
} );
