import { getMCPByDomain, getMCPDomainRegistryEntry, type MCPRegistryEntry } from '../mcp-registry';

// Remove globalThis.jest so the real (non-mock) code paths run in these tests.
const originalJest = globalThis.jest;
beforeEach( () => {
	// @ts-ignore
	delete globalThis.jest;
} );
afterEach( () => {
	// @ts-ignore
	globalThis.jest = originalJest;
} );

// Mock McpServer so we don't need the full MCP SDK in tests.
jest.mock( '@modelcontextprotocol/sdk/server/mcp.js', () => {
	return {
		McpServer: jest.fn().mockImplementation( () => ( {
			registerTool: jest.fn(),
			sendToolListChanged: jest.fn(),
			registerResource: jest.fn(),
			server: {
				sendResourceUpdated: jest.fn(),
			},
		} ) ),
	};
} );

jest.mock( '../utils/get-sdk', () => ( {
	getSDK: jest.fn( () => ( {
		waitForReady: jest.fn().mockResolvedValue( undefined ),
	} ) ),
} ) );

// Use fake timers to control setTimeout.
beforeEach( () => {
	jest.useFakeTimers();
} );
afterEach( () => {
	jest.useRealTimers();
} );

// Each test needs a unique namespace to avoid registry pollution between tests.
// isAlphabet only allows [a-z_], so we encode the counter as letters.
let namespaceCounter = 0;
function uniqueNs(): string {
	const letters = 'abcdefghijklmnopqrstuvwxyz';
	let n = ++namespaceCounter;
	let suffix = '';
	do {
		suffix = letters[ ( n - 1 ) % 26 ] + suffix;
		n = Math.floor( ( n - 1 ) / 26 );
	} while ( n > 0 );
	return `testns${ suffix }`;
}

describe( 'getMCPDomainRegistryEntry', () => {
	it( 'resolves immediately when the domain is already registered', async () => {
		const ns = uniqueNs();
		getMCPByDomain( ns );

		const entry = await getMCPDomainRegistryEntry( ns );

		expect( entry ).toBeDefined();
		expect( typeof entry?.addTool ).toBe( 'function' );
	} );

	it( 'resolves when getMCPByDomain is called after getMCPByDomainAsync', async () => {
		const ns = uniqueNs();
		const entryPromise = getMCPDomainRegistryEntry( ns );

		// Domain registers after the async waiter is already set up.
		getMCPByDomain( ns );

		const entry = await entryPromise;
		expect( entry ).toBeDefined();
		expect( typeof entry?.addTool ).toBe( 'function' );
	} );

	it( 'resolves undefined after timeout when domain never registers', async () => {
		const ns = uniqueNs();
		const entryPromise = getMCPDomainRegistryEntry( ns, { timeoutMs: 100 } );

		jest.advanceTimersByTime( 100 );

		const entry = await entryPromise;
		expect( entry ).toBeUndefined();
	} );

	it( 'respects custom timeoutMs option', async () => {
		const ns = uniqueNs();
		const entryPromise = getMCPDomainRegistryEntry( ns, { timeoutMs: 500 } );

		// Has not resolved yet at 499ms.
		jest.advanceTimersByTime( 499 );
		// Advance to 500ms to trigger timeout.
		jest.advanceTimersByTime( 1 );

		const entry = await entryPromise;
		expect( entry ).toBeUndefined();
	} );

	it( 'resolves all concurrent waiters when the domain registers', async () => {
		const ns = uniqueNs();
		const promise1 = getMCPDomainRegistryEntry( ns );
		const promise2 = getMCPDomainRegistryEntry( ns );
		const promise3 = getMCPDomainRegistryEntry( ns );

		getMCPByDomain( ns );

		const [ e1, e2, e3 ] = await Promise.all( [ promise1, promise2, promise3 ] );
		expect( e1 ).toBeDefined();
		expect( e2 ).toBeDefined();
		expect( e3 ).toBeDefined();
	} );

	it( 'all concurrent waiters receive the same entry reference', async () => {
		const ns = uniqueNs();
		const promise1 = getMCPDomainRegistryEntry( ns );
		const promise2 = getMCPDomainRegistryEntry( ns );

		getMCPByDomain( ns );

		const [ e1, e2 ] = await Promise.all( [ promise1, promise2 ] );
		expect( e1 ).toBe( e2 );
	} );

	it( 'a timed-out waiter does not cancel other pending waiters', async () => {
		const ns = uniqueNs();
		const shortWaiter = getMCPDomainRegistryEntry( ns, { timeoutMs: 100 } );
		const longWaiter = getMCPDomainRegistryEntry( ns, { timeoutMs: 5000 } );

		// Only the short waiter times out.
		jest.advanceTimersByTime( 100 );
		expect( await shortWaiter ).toBeUndefined();

		// Long waiter is still pending; register the domain to resolve it.
		getMCPByDomain( ns );
		expect( await longWaiter ).toBeDefined();
	} );

	it( 'rejects with an error for an invalid namespace', async () => {
		await expect( getMCPDomainRegistryEntry( 'INVALID_UPPER' ) ).rejects.toThrow();
	} );
} );

function isValidEntry( entry: MCPRegistryEntry | undefined ): entry is MCPRegistryEntry {
	return (
		typeof entry?.addTool === 'function' &&
		typeof entry?.setMCPDescription === 'function' &&
		typeof entry?.getActiveChatInfo === 'function' &&
		typeof entry?.waitForReady === 'function'
	);
}

describe( 'getMCPDomainRegistryEntry — returned entry shape', () => {
	it( 'returned entry has all MCPRegistryEntry methods', async () => {
		const ns = uniqueNs();
		getMCPByDomain( ns );
		const entry = await getMCPDomainRegistryEntry( ns );
		expect( isValidEntry( entry ) ).toBe( true );
	} );
} );
