import { AngieMcpSdk } from '@elementor-external/angie-sdk';

class MessageChannelStub {
	port1 = {};
	port2 = {};
}

describe( 'Angie SDK internals relied on by get-sdk', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		( globalThis as Record< string, unknown > ).MessageChannel = MessageChannelStub;
	} );

	afterEach( () => {
		jest.useRealTimers();
		delete ( globalThis as Record< string, unknown > ).MessageChannel;
	} );

	it( 'should expose an angieDetector with a waitForReady method', () => {
		// Arrange
		const sdk = new AngieMcpSdk( { appId: 'test' } );

		// Act
		const detector = ( sdk as unknown as { angieDetector?: { waitForReady?: unknown } } ).angieDetector;

		// Assert
		expect( typeof detector?.waitForReady ).toBe( 'function' );
	} );
} );
