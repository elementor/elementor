jest.mock( '../create-inline-text-generator-mcp-server', () => ( {
	createInlineTextGeneratorMcpServer: jest.fn( () => ( {} ) ),
} ) );

const mockLoadSidebarV2 = jest.fn();
const mockWaitForReady = jest.fn();
const mockRegisterServer = jest.fn();
const mockTriggerAngie = jest.fn();

const mockSdkInstance = {
	loadSidebarV2: mockLoadSidebarV2,
	waitForReady: mockWaitForReady,
	registerServer: mockRegisterServer,
	triggerAngie: mockTriggerAngie,
};

const mockCreateAngieMcpSdkInstance = jest.fn( () => mockSdkInstance );

jest.mock( '@elementor/editor-mcp', () => ( {
	createAngieMcpSdkInstance: () => mockCreateAngieMcpSdkInstance(),
	LAYOUT_FLOATING_CHAT: 'floatingChat',
} ) );

import {
	bootInlineTextGeneratorSdk,
	getInlineTextGeneratorLoadSidebarOptions,
	openInlineTextGeneratorWithPrompt,
	resetInlineTextGeneratorBootStateForTests,
} from '../boot-inline-text-generator-sdk';
import {
	INLINE_TEXT_GENERATOR_APP_ID,
	INLINE_TEXT_GENERATOR_CONTAINER_ID,
	INLINE_TEXT_GENERATOR_INSTANCE_ID,
	INLINE_TEXT_GENERATOR_MCP_SERVER_NAME,
} from '../constants';

describe( 'bootInlineTextGeneratorSdk', () => {
	beforeEach( () => {
		resetInlineTextGeneratorBootStateForTests();
		jest.clearAllMocks();
		mockLoadSidebarV2.mockResolvedValue( undefined );
		mockWaitForReady.mockResolvedValue( undefined );
		mockRegisterServer.mockResolvedValue( undefined );
		mockTriggerAngie.mockResolvedValue( { success: true, requestId: 'request-1' } );
	} );

	it( 'should boot the dedicated floating Angie instance with expected options', async () => {
		// Arrange.
		const expectedOptions = getInlineTextGeneratorLoadSidebarOptions();

		// Act.
		await bootInlineTextGeneratorSdk();

		// Assert.
		expect( mockCreateAngieMcpSdkInstance ).toHaveBeenCalledTimes( 1 );
		expect( mockLoadSidebarV2 ).toHaveBeenCalledWith( expectedOptions );
		expect( mockWaitForReady ).toHaveBeenCalled();
		expect( mockRegisterServer ).toHaveBeenCalledWith(
			expect.objectContaining( {
				name: INLINE_TEXT_GENERATOR_MCP_SERVER_NAME,
				version: '1.0.0',
			} )
		);
	} );

	it( 'should open the dedicated instance and trigger a focused prompt', async () => {
		// Arrange.
		const container = document.createElement( 'div' );
		container.id = INLINE_TEXT_GENERATOR_CONTAINER_ID;
		container.classList.add( 'angie-widget-hidden' );
		document.body.appendChild( container );

		// Act.
		await openInlineTextGeneratorWithPrompt();

		// Assert.
		expect( container ).not.toHaveClass( 'angie-widget-hidden' );
		expect( mockTriggerAngie ).toHaveBeenCalledWith(
			expect.objectContaining( {
				context: {
					source: INLINE_TEXT_GENERATOR_APP_ID,
				},
				options: {
					newChat: true,
				},
			} )
		);

		document.body.removeChild( container );
	} );

	it( 'should use stable app and instance ids in load sidebar options', () => {
		// Arrange.
		const options = getInlineTextGeneratorLoadSidebarOptions();

		// Assert.
		expect( options.host.appId ).toBe( INLINE_TEXT_GENERATOR_APP_ID );
		expect( options.host.instanceId ).toBe( INLINE_TEXT_GENERATOR_INSTANCE_ID );
		expect( options.container?.id ).toBe( INLINE_TEXT_GENERATOR_CONTAINER_ID );
		expect( options.container?.layout ).toBe( 'floatingChat' );
		expect( options.widgetConfig?.localServers ).toEqual( { skipLoading: true } );
		expect( options.widgetConfig?.featuredMcpServer ).toBe( INLINE_TEXT_GENERATOR_MCP_SERVER_NAME );
	} );

	it( 'should retry boot after a failed attempt', async () => {
		// Arrange.
		mockLoadSidebarV2.mockRejectedValueOnce( new Error( 'boot failed' ) );

		// Act.
		await expect( bootInlineTextGeneratorSdk() ).rejects.toThrow( 'boot failed' );
		mockLoadSidebarV2.mockResolvedValue( undefined );
		await bootInlineTextGeneratorSdk();

		// Assert.
		expect( mockCreateAngieMcpSdkInstance ).toHaveBeenCalledTimes( 2 );
	} );
} );
