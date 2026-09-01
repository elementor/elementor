const LAYOUT_FLOATING_CHAT = 'floating-chat';
const mockToggleAngieSidebar = jest.fn();
const mockLoadSidebarV2 = jest.fn();
const mockTriggerAngie = jest.fn();
const mockRegisterAngieMcpServers = jest.fn();
const mockIsAngieReady = jest.fn();
const mockFloatingChatSdk = {
	loadSidebarV2: mockLoadSidebarV2,
	triggerAngie: mockTriggerAngie,
	isAngieReady: () => mockIsAngieReady(),
};
const mockDefaultSdk = {
	loadSidebarV2: jest.fn(),
	triggerAngie: jest.fn(),
	isAngieReady: jest.fn(),
};

jest.mock( '@elementor-external/angie-sdk', () => ( {
	LAYOUT_FLOATING_CHAT,
	toggleAngieSidebar: ( ...args: unknown[] ) => mockToggleAngieSidebar( ...args ),
} ) );

jest.mock( '../../mcp-registry', () => ( {
	registerAngieMcpServers: ( ...args: unknown[] ) => mockRegisterAngieMcpServers( ...args ),
} ) );

jest.mock( '../get-sdk', () => ( {
	ANGIE_FLOATING_CHAT_INSTANCE: 'elementor-inline-floating-chat',
	getSDK: ( instanceKey?: string ) =>
		instanceKey === 'elementor-inline-floating-chat' ? mockFloatingChatSdk : mockDefaultSdk,
} ) );

const APP_ID = 'elementor-editor-title-generation';
const SOURCE = 'atomic_heading_title';
const PROMPT = 'Generate a heading title';
const WIDGET_CONFIG = { title: 'Generate a title' };
const MCP_NAMESPACE = 'title_generation';
const FLOATING_CHAT_CONTAINER_ID = 'angie-floating-chat-container';
const FLOATING_CHAT_INSTANCE_ID = 'elementor-inline-floating-chat';

const defaultArgs = {
	appId: APP_ID,
	prompt: PROMPT,
	source: SOURCE,
	mcpServers: [ MCP_NAMESPACE ],
	widgetConfig: WIDGET_CONFIG,
};

describe( 'openAngieFloatingChat', () => {
	beforeEach( () => {
		jest.resetModules();
		mockToggleAngieSidebar.mockReset();
		mockLoadSidebarV2.mockReset();
		mockTriggerAngie.mockReset();
		mockRegisterAngieMcpServers.mockReset();
		mockIsAngieReady.mockReset();
		mockLoadSidebarV2.mockResolvedValue( undefined );
		mockTriggerAngie.mockResolvedValue( undefined );
		mockRegisterAngieMcpServers.mockResolvedValue( undefined );
		mockIsAngieReady.mockReturnValue( true );
	} );

	it( 'boots Angie on a dedicated instance, registers scoped MCP servers, opens the chat, and triggers a new chat', async () => {
		// Arrange
		const iframe = document.createElement( 'iframe' );
		const container = document.createElement( 'div' );
		container.id = FLOATING_CHAT_CONTAINER_ID;
		container.appendChild( iframe );
		document.body.appendChild( container );

		const { openAngieFloatingChat } = await import( '../open-angie-floating-chat' );

		// Act
		await openAngieFloatingChat( defaultArgs );

		// Assert
		expect( mockLoadSidebarV2 ).toHaveBeenCalledTimes( 1 );
		expect( mockLoadSidebarV2 ).toHaveBeenCalledWith( {
			host: { appId: APP_ID, instanceId: FLOATING_CHAT_INSTANCE_ID, aiContext: undefined },
			sdkInstanceId: FLOATING_CHAT_INSTANCE_ID,
			container: {
				id: FLOATING_CHAT_CONTAINER_ID,
				layout: LAYOUT_FLOATING_CHAT,
				chatToggleButton: { enabled: false, selector: '' },
			},
			widgetConfig: WIDGET_CONFIG,
		} );
		expect( mockRegisterAngieMcpServers ).toHaveBeenCalledWith( [ MCP_NAMESPACE ], mockFloatingChatSdk );
		expect( mockToggleAngieSidebar ).toHaveBeenCalledWith( iframe, true, FLOATING_CHAT_CONTAINER_ID );
		expect( mockTriggerAngie ).toHaveBeenCalledWith( {
			prompt: PROMPT,
			context: { source: SOURCE },
			options: { newChat: true },
		} );

		container.remove();
	} );

	it( 'positions the chat next to the anchor element', async () => {
		// Arrange
		const CHAT_WIDTH = 360;
		const CHAT_GAP = 8;
		const ANCHOR_RIGHT = 200;
		const ANCHOR_TOP = 120;

		const container = document.createElement( 'div' );
		container.id = FLOATING_CHAT_CONTAINER_ID;
		container.appendChild( document.createElement( 'iframe' ) );
		document.body.appendChild( container );

		const anchorElement = document.createElement( 'button' );
		anchorElement.getBoundingClientRect = () => ( { right: ANCHOR_RIGHT, top: ANCHOR_TOP } ) as DOMRect;

		const { openAngieFloatingChat } = await import( '../open-angie-floating-chat' );

		// Act
		await openAngieFloatingChat( { ...defaultArgs, anchorElement } );

		// Assert
		expect( container ).toHaveStyle( {
			left: `${ ANCHOR_RIGHT + CHAT_GAP }px`,
			top: `${ ANCHOR_TOP }px`,
			width: `${ CHAT_WIDTH }px`,
		} );
		expect( container.style.getPropertyPriority( 'left' ) ).toBe( 'important' );

		container.remove();
	} );

	it( 'does not boot Angie again on a second call but still triggers a new chat', async () => {
		// Arrange
		const container = document.createElement( 'div' );
		container.id = FLOATING_CHAT_CONTAINER_ID;
		container.appendChild( document.createElement( 'iframe' ) );
		document.body.appendChild( container );

		const { openAngieFloatingChat } = await import( '../open-angie-floating-chat' );

		// Act
		await openAngieFloatingChat( defaultArgs );
		await openAngieFloatingChat( { ...defaultArgs, prompt: 'Second prompt' } );

		// Assert
		expect( mockLoadSidebarV2 ).toHaveBeenCalledTimes( 1 );
		expect( mockRegisterAngieMcpServers ).toHaveBeenCalledTimes( 2 );
		expect( mockTriggerAngie ).toHaveBeenCalledTimes( 2 );
		expect( mockTriggerAngie ).toHaveBeenLastCalledWith( {
			prompt: 'Second prompt',
			context: { source: SOURCE },
			options: { newChat: true },
		} );

		container.remove();
	} );
} );
