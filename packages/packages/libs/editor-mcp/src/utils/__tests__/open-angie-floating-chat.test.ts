const LAYOUT_FLOATING_CHAT = 'floating-chat';
const DEFAULT_CONTAINER_ID = 'angie-sidebar-container';
const mockGetAngieIframe = jest.fn();
const mockToggleAngieSidebar = jest.fn();
const mockLoadSidebarV2 = jest.fn();
const mockTriggerAngie = jest.fn();
const mockRegisterAngieMcpServers = jest.fn();

jest.mock( '@elementor-external/angie-sdk', () => ( {
	DEFAULT_CONTAINER_ID,
	LAYOUT_FLOATING_CHAT,
	getAngieIframe: () => mockGetAngieIframe(),
	toggleAngieSidebar: ( ...args: unknown[] ) => mockToggleAngieSidebar( ...args ),
} ) );

jest.mock( '../../mcp-registry', () => ( {
	registerAngieMcpServers: ( ...args: unknown[] ) => mockRegisterAngieMcpServers( ...args ),
} ) );

jest.mock( '../get-sdk', () => ( {
	getSDK: () => ( {
		loadSidebarV2: mockLoadSidebarV2,
		triggerAngie: mockTriggerAngie,
	} ),
} ) );

const APP_ID = 'elementor-editor-title-generation';
const SOURCE = 'atomic_heading_title';
const PROMPT = 'Generate a heading title';
const WIDGET_CONFIG = { title: 'Generate a title' };
const MCP_NAMESPACE = 'title_generation';

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
		mockGetAngieIframe.mockReset();
		mockToggleAngieSidebar.mockReset();
		mockLoadSidebarV2.mockReset();
		mockTriggerAngie.mockReset();
		mockRegisterAngieMcpServers.mockReset();
		mockLoadSidebarV2.mockResolvedValue( undefined );
		mockTriggerAngie.mockResolvedValue( undefined );
		mockRegisterAngieMcpServers.mockResolvedValue( undefined );
	} );

	it( 'boots Angie, activates the adapter, opens the chat, and triggers a new chat', async () => {
		// Arrange
		const iframe = document.createElement( 'iframe' );
		mockGetAngieIframe.mockReturnValue( iframe );
		const { openAngieFloatingChat } = await import( '../open-angie-floating-chat' );

		// Act
		await openAngieFloatingChat( defaultArgs );

		// Assert
		expect( mockLoadSidebarV2 ).toHaveBeenCalledTimes( 1 );
		expect( mockLoadSidebarV2 ).toHaveBeenCalledWith( {
			host: { appId: APP_ID, aiContext: undefined },
			container: {
				layout: LAYOUT_FLOATING_CHAT,
				chatToggleButton: { enabled: false, selector: '' },
			},
			widgetConfig: WIDGET_CONFIG,
		} );
		expect( mockRegisterAngieMcpServers ).toHaveBeenCalledWith( [ MCP_NAMESPACE ] );
		expect( mockToggleAngieSidebar ).toHaveBeenCalledWith( iframe, true );
		expect( mockTriggerAngie ).toHaveBeenCalledWith( {
			prompt: PROMPT,
			context: { source: SOURCE },
			options: { newChat: true },
		} );
	} );

	it( 'positions the chat next to the anchor element', async () => {
		// Arrange
		const CHAT_WIDTH = 360;
		const CHAT_GAP = 8;
		const ANCHOR_RIGHT = 200;
		const ANCHOR_TOP = 120;

		mockGetAngieIframe.mockReturnValue( document.createElement( 'iframe' ) );

		const container = document.createElement( 'div' );
		container.id = DEFAULT_CONTAINER_ID;
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
		const iframe = document.createElement( 'iframe' );
		mockGetAngieIframe.mockReturnValue( iframe );
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
	} );
} );
