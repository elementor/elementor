import { registerModelExtensions } from '../init-legacy-views';
import { initMenuModelExtensions } from '../menu-model-extensions';

jest.mock( '../init-legacy-views', () => ( { registerModelExtensions: jest.fn() } ) );

describe( 'menu model extensions', () => {
	const getExtensions = ( type: string ) =>
		( registerModelExtensions as jest.Mock ).mock.calls.find( ( [ t ] ) => t === type )?.[ 1 ];

	const model = ( values: Record< string, unknown > ) => ( { get: ( key: string ) => values[ key ] } );

	beforeEach( () => {
		( registerModelExtensions as jest.Mock ).mockClear();
		( window as unknown as { elementor: unknown } ).elementor = {
			config: {
				elements: {
					'e-menu-entry': { allowed_child_types: [ 'e-menu-item' ] },
					'e-menu-item': { allowed_child_types: [] },
				},
			},
		};
		initMenuModelExtensions();
	} );

	it( 'should register extensions only for menu elements', () => {
		expect( ( registerModelExtensions as jest.Mock ).mock.calls.map( ( [ t ] ) => t ) ).toEqual( [
			'e-menu',
			'e-menu-items',
			'e-menu-entry',
			'e-menu-item',
		] );
	} );

	it( 'should only accept allowed child types', () => {
		const { isValidChild } = getExtensions( 'e-menu-entry' );
		const entry = model( { elType: 'e-menu-entry' } );

		expect( isValidChild.call( entry, model( { elType: 'e-menu-item' } ) ) ).toBe( true );
		expect( isValidChild.call( entry, model( { elType: 'widget', widgetType: 'e-heading' } ) ) ).toBe( false );
		expect( isValidChild.call( entry, model( { elType: 'section' } ) ) ).toBe( false );
	} );

	it( 'should accept any child when no types are restricted', () => {
		const { isValidChild } = getExtensions( 'e-menu-item' );

		expect(
			isValidChild.call(
				model( { elType: 'e-menu-item' } ),
				model( { elType: 'widget', widgetType: 'e-paragraph' } )
			)
		).toBe( true );
	} );
} );
