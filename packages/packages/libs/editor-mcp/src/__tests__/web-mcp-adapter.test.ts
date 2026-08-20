import { type McpToolDescriptor } from '../adapters/types';
import { WebMCPAdapter } from '../adapters/web-mcp-adapter';
import { type ModelContextRegisterTool, registerModelContextTool } from '../utils/register-model-context-tool';

const createTool = ( name: string ): McpToolDescriptor => ( {
	name,
	description: `${ name } description`,
	inputSchema: { type: 'object', properties: {} },
	execute: async () => 'ok',
} );

const flushPromises = (): Promise< void > => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

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
		expect( registerTool ).toHaveBeenCalledWith( expect.objectContaining( { name: 'editor-resource-getter' } ) );
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
		await flushPromises();

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
		await flushPromises();
		adapter.onToolRegistered( tool );
		await flushPromises();

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
		await flushPromises();

		// Assert.
		expect( consoleErrorSpy ).toHaveBeenCalledWith( 'Tool registration failed:', registrationError );
	} );

	it( 'allows overlapping registrations to complete independently', async () => {
		// Arrange.
		const completedDescriptions: string[] = [];
		let resolveSlowRegistration!: () => void;
		let callCount = 0;
		const registerTool = jest.fn< ReturnType< ModelContextRegisterTool >, Parameters< ModelContextRegisterTool > >(
			( tool ) => {
				callCount += 1;
				if ( callCount === 1 ) {
					return new Promise< void >( ( resolve ) => {
						resolveSlowRegistration = () => {
							completedDescriptions.push( tool.description );
							resolve();
						};
					} );
				}

				completedDescriptions.push( tool.description );
				return Promise.resolve();
			}
		);
		const adapter = new WebMCPAdapter( { registerTool } );

		// Act.
		adapter.onToolRegistered( createTool( 'page-tool' ) );
		adapter.onToolRegistered( { ...createTool( 'page-tool' ), description: 'updated description' } );
		await flushPromises();

		// Assert.
		expect( completedDescriptions ).toEqual( [ 'updated description' ] );

		resolveSlowRegistration();
		await flushPromises();

		expect( completedDescriptions ).toEqual( [ 'updated description', 'page-tool description' ] );
		expect( registerTool ).toHaveBeenCalledTimes( 2 );
	} );
} );
