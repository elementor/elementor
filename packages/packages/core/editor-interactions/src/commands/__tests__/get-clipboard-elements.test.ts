import { getClipboardElements } from '../get-clipboard-elements';

const ELEMENTOR_STORAGE_KEY = 'elementor';
const CLIPBOARD_KEY = 'clipboard';

describe( 'getClipboardElements', () => {
	const originalLocalStorage = globalThis.localStorage;

	beforeEach( () => {
		Object.defineProperty( globalThis, 'localStorage', {
			value: {
				getItem: jest.fn(),
				setItem: jest.fn(),
				removeItem: jest.fn(),
				clear: jest.fn(),
				length: 0,
				key: jest.fn(),
			},
			writable: true,
		} );
	} );

	afterEach( () => {
		Object.defineProperty( globalThis, 'localStorage', {
			value: originalLocalStorage,
			writable: true,
		} );
	} );

	it( 'should return clipboard elements when storage has valid data', () => {
		const elements = [ { id: 'el-1', elType: 'widget', interactions: { version: 1, items: [] } } ];
		const stored = JSON.stringify( {
			[ CLIPBOARD_KEY ]: { elements },
		} );

		jest.mocked( localStorage.getItem ).mockReturnValue( stored );

		const result = getClipboardElements( CLIPBOARD_KEY );

		expect( localStorage.getItem ).toHaveBeenCalledWith( ELEMENTOR_STORAGE_KEY );
		expect( result ).toEqual( elements );
	} );

	it( 'should use default storageKey "clipboard" when not provided', () => {
		const elements = [ { id: 'el-1', elType: 'widget' } ];
		jest.mocked( localStorage.getItem ).mockReturnValue( JSON.stringify( { clipboard: { elements } } ) );

		const result = getClipboardElements();

		expect( result ).toEqual( elements );
	} );

	it( 'should return undefined when storage key has no elements', () => {
		jest.mocked( localStorage.getItem ).mockReturnValue( JSON.stringify( { [ CLIPBOARD_KEY ]: {} } ) );

		const result = getClipboardElements( CLIPBOARD_KEY );

		expect( result ).toBeUndefined();
	} );

	it( 'should return undefined when storage is empty', () => {
		jest.mocked( localStorage.getItem ).mockReturnValue( '{}' );

		const result = getClipboardElements( CLIPBOARD_KEY );

		expect( result ).toBeUndefined();
	} );

	it( 'should return undefined when getItem returns null', () => {
		jest.mocked( localStorage.getItem ).mockReturnValue( null );

		const result = getClipboardElements( CLIPBOARD_KEY );

		expect( result ).toBeUndefined();
	} );

	it( 'should return undefined when JSON is invalid', () => {
		jest.mocked( localStorage.getItem ).mockReturnValue( 'invalid json' );

		const result = getClipboardElements( CLIPBOARD_KEY );

		expect( result ).toBeUndefined();
	} );

	it( 'should return elements for custom storageKey', () => {
		const customKey = 'custom-clipboard';
		const elements = [ { id: 'el-1', elType: 'container' } ];
		jest.mocked( localStorage.getItem ).mockReturnValue( JSON.stringify( { [ customKey ]: { elements } } ) );

		const result = getClipboardElements( customKey );

		expect( result ).toEqual( elements );
	} );
} );
