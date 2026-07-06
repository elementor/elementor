import { WebMCPAdapter } from '../adapters/web-mcp-adapter';
import {
	registerModelContextTool,
	unregisterModelContextTool,
} from '../utils/register-model-context-tool';

const createTool = ( name: string ) => ( {
	name,
	description: `${ name } description`,
	inputSchema: { type: 'object', properties: {} },
	execute: async () => 'ok',
} );

describe( 'registerModelContextTool', () => {
	let consoleErrorSpy: jest.SpyInstance;

	beforeEach( () => {
		consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => undefined );
	} );

	afterEach( () => {
		consoleErrorSpy.mockRestore();
	} );

	it( 'awaits async registerTool implementations', async () => {
		// Arrange.
		const tool = createTool( 'async-tool' );
		const registerTool = jest.fn( () => Promise.resolve() );

		// Act.
		await registerModelContextTool( registerTool, tool );

		// Assert.
		expect( registerTool ).toHaveBeenCalledWith( tool );
	} );

	it( 'supports legacy synchronous registerTool implementations', async () => {
		// Arrange.
		const tool = createTool( 'sync-tool' );
		const registerTool = jest.fn();

		// Act.
		await registerModelContextTool( registerTool, tool );

		// Assert.
		expect( registerTool ).toHaveBeenCalledWith( tool );
	} );

	it( 'logs registration failures without throwing', async () => {
		// Arrange.
		const tool = createTool( 'failing-tool' );
		const registrationError = new Error( 'duplicate tool' );
		const registerTool = jest.fn( () => Promise.reject( registrationError ) );

		// Act.
		await registerModelContextTool( registerTool, tool );

		// Assert.
		expect( consoleErrorSpy ).toHaveBeenCalledWith( 'Tool registration failed:', registrationError );
	} );
} );

describe( 'unregisterModelContextTool', () => {
	it( 'calls unregisterTool when it is available', () => {
		// Arrange.
		const unregisterTool = jest.fn();

		// Act.
		unregisterModelContextTool( unregisterTool, 'tool-name' );

		// Assert.
		expect( unregisterTool ).toHaveBeenCalledWith( 'tool-name' );
	} );

	it( 'does nothing when unregisterTool is unavailable', () => {
		// Act & Assert.
		expect( () => unregisterModelContextTool( undefined, 'tool-name' ) ).not.toThrow();
	} );
} );

describe( 'WebMCPAdapter', () => {
	let consoleErrorSpy: jest.SpyInstance;

	beforeEach( () => {
		consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => undefined );
	} );

	afterEach( () => {
		consoleErrorSpy.mockRestore();
	} );

	it( 'awaits async registerTool during activate', async () => {
		// Arrange.
		let resolveRegisterTool!: () => void;
		const registerTool = jest.fn(
			() =>
				new Promise< void >( ( resolve ) => {
					resolveRegisterTool = resolve;
				} )
		);
		const adapter = new WebMCPAdapter( { registerTool } );
		let activateSettled = false;
		const activatePromise = adapter.activate().then( () => {
			activateSettled = true;
		} );

		// Act.
		await Promise.resolve();
		expect( registerTool ).toHaveBeenCalledWith(
			expect.objectContaining( { name: 'editor-resource-getter' } )
		);
		expect( activateSettled ).toBe( false );
		resolveRegisterTool();
		await activatePromise;

		// Assert.
		expect( activateSettled ).toBe( true );
	} );

	it( 'registers tools asynchronously from onToolRegistered', async () => {
		// Arrange.
		const registerTool = jest.fn( () => Promise.resolve() );
		const adapter = new WebMCPAdapter( { registerTool } );
		const tool = createTool( 'page-tool' );

		// Act.
		adapter.onToolRegistered( tool );
		await Promise.resolve();

		// Assert.
		expect( registerTool ).toHaveBeenCalledWith(
			expect.objectContaining( {
				name: 'page-tool',
				description: 'page-tool description',
			} )
		);
	} );

	it( 'unregisters an existing tool before re-registering it', async () => {
		// Arrange.
		const unregisterTool = jest.fn();
		const registerTool = jest.fn( () => Promise.resolve() );
		const adapter = new WebMCPAdapter( { registerTool, unregisterTool } );
		const tool = createTool( 'page-tool' );

		// Act.
		adapter.onToolRegistered( tool );
		adapter.onToolRegistered( tool );
		await Promise.resolve();

		// Assert.
		expect( unregisterTool ).toHaveBeenCalledWith( 'page-tool' );
		expect( registerTool ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'logs async registration failures from onToolRegistered', async () => {
		// Arrange.
		const registrationError = new Error( 'registration failed' );
		const registerTool = jest.fn( () => Promise.reject( registrationError ) );
		const adapter = new WebMCPAdapter( { registerTool } );

		// Act.
		adapter.onToolRegistered( createTool( 'page-tool' ) );
		await Promise.resolve();

		// Assert.
		expect( consoleErrorSpy ).toHaveBeenCalledWith( 'Tool registration failed:', registrationError );
	} );
} );
