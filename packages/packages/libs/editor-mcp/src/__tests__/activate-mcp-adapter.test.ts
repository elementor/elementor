import { type IMcpRegistrationAdapter } from '../adapters/types';

jest.mock( '../utils/get-sdk', () => ( {
	getSDK: jest.fn(),
} ) );

jest.mock( '../utils/is-angie-available', () => ( {
	isAngieAvailable: jest.fn( () => false ),
} ) );

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type RegistryModule = typeof import('../mcp-registry');

const loadRegistry = (): RegistryModule => {
	jest.resetModules();

	return require( '../mcp-registry' ) as RegistryModule;
};

class TestAdapter implements IMcpRegistrationAdapter {
	activate = jest.fn().mockResolvedValue( undefined );
	onToolRegistered = jest.fn();
	onResourceRegistered = jest.fn();
	sendResourceUpdated = jest.fn();
}

const flushPromises = (): Promise< void > => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

describe( 'activateMcpAdapter', () => {
	it( 'activates the adapter only after startup', async () => {
		// Arrange
		const registry = loadRegistry();
		const adapter = new TestAdapter();

		// Act
		const activation = registry.activateMcpAdapter( adapter );
		await flushPromises();

		// Assert
		expect( adapter.activate ).not.toHaveBeenCalled();

		registry.signalMcpReady();
		await activation;

		expect( adapter.activate ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'is not activated again by the startup activation', async () => {
		// Arrange
		const registry = loadRegistry();
		const adapter = new TestAdapter();
		const activation = registry.activateMcpAdapter( adapter );

		// Act
		await registry.createAndRegisterAdapters();
		registry.signalMcpReady();
		await activation;

		// Assert
		expect( adapter.activate ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'reports registered adapters by type', async () => {
		// Arrange
		const registry = loadRegistry();
		registry.signalMcpReady();

		// Act
		await registry.activateMcpAdapter( new TestAdapter() );

		// Assert
		expect( registry.hasMcpAdapter( TestAdapter ) ).toBe( true );
	} );
} );
