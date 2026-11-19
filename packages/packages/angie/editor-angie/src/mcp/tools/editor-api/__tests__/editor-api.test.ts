import { applyDocumentElementSettings } from '../../editor-api';

describe( 'editor-api', () => {
	let run: jest.Mock;

	beforeEach( () => {
		run = jest.fn( () => Promise.resolve() );

		Object.defineProperty( window, '$e', {
			configurable: true,
			writable: true,
			value: { run },
		} );
	} );

	afterEach( () => {
		Reflect.deleteProperty( window, '$e' );
		jest.clearAllMocks();
	} );

	it( 'applyDocumentElementSettings runs document/elements/settings with external: true', async () => {
		// Arrange
		const container = { settings: { get: jest.fn() } };
		const settings = { site_name: 'Test' };

		// Act
		await applyDocumentElementSettings( container, settings );

		// Assert
		expect( run ).toHaveBeenCalledWith( 'document/elements/settings', {
			container,
			settings,
			options: { external: true },
		} );
	} );

	it( 'applyDocumentElementSettings throws when commands API is missing', async () => {
		// Arrange
		Reflect.deleteProperty( window, '$e' );

		// Act / Assert
		await expect( applyDocumentElementSettings( {}, {} ) ).rejects.toThrow( /commands API is not available/ );
	} );
} );
