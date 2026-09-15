jest.mock( '../create-inline-text-generator-mcp-server', () => ( {
	createInlineTextGeneratorMcpServer: jest.fn( () => ( {} ) ),
} ) );

const mockLoadSidebarV2 = jest.fn();
const mockRegisterServer = jest.fn();
const mockTriggerAngie = jest.fn();

const mockSdkInstance = {
	loadSidebarV2: mockLoadSidebarV2,
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
	ANGIE_WIDGET_HIDDEN_CLASS,
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
		mockRegisterServer.mockResolvedValue( undefined );
		mockTriggerAngie.mockResolvedValue( { success: true, requestId: 'request-1' } );
	} );

	it( 'should register the server before loading the sidebar to leverage the SDK queue', async () => {
		// Arrange.
		const callOrder: string[] = [];
		mockRegisterServer.mockImplementation( async () => {
			callOrder.push( 'register' );
		} );
		mockLoadSidebarV2.mockImplementation( async () => {
			callOrder.push( 'load' );
		} );

		// Act.
		await bootInlineTextGeneratorSdk();

		// Assert.
		expect( callOrder ).toEqual( [ 'register', 'load' ] );
		expect( mockRegisterServer ).toHaveBeenCalledWith(
			expect.objectContaining( {
				name: INLINE_TEXT_GENERATOR_MCP_SERVER_NAME,
				version: '1.0.0',
			} )
		);
	} );

	it( 'should boot the dedicated floating Angie instance with expected options', async () => {
		// Arrange.
		const expectedOptions = getInlineTextGeneratorLoadSidebarOptions();

		// Act.
		await bootInlineTextGeneratorSdk();

		// Assert.
		expect( mockCreateAngieMcpSdkInstance ).toHaveBeenCalledTimes( 1 );
		expect( mockLoadSidebarV2 ).toHaveBeenCalledWith( expectedOptions );
	} );

	it( 'should open the dedicated instance and trigger a focused prompt', async () => {
		// Arrange.
		const container = document.createElement( 'div' );
		container.id = INLINE_TEXT_GENERATOR_CONTAINER_ID;
		container.classList.add( ANGIE_WIDGET_HIDDEN_CLASS );
		document.body.appendChild( container );

		// Act.
		await openInlineTextGeneratorWithPrompt();

		// Assert.
		expect( container ).not.toHaveClass( ANGIE_WIDGET_HIDDEN_CLASS );
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

	describe( 'container placement', () => {
		const CONTAINER_WIDTH = 400;
		const CONTAINER_HEIGHT = 600;

		const mountContainer = () => {
			const container = document.createElement( 'div' );
			container.id = INLINE_TEXT_GENERATOR_CONTAINER_ID;
			container.getBoundingClientRect = () =>
				( {
					top: 0,
					right: CONTAINER_WIDTH,
					bottom: CONTAINER_HEIGHT,
					left: 0,
					width: CONTAINER_WIDTH,
					height: CONTAINER_HEIGHT,
					x: 0,
					y: 0,
					toJSON: () => ( {} ),
				} ) as DOMRect;
			document.body.appendChild( container );
			return container;
		};

		const mountAnchor = ( rect: Partial< DOMRect > ) => {
			const anchor = document.createElement( 'button' );
			const filledRect = {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
				width: 20,
				height: 20,
				x: 0,
				y: 0,
				toJSON: () => ( {} ),
				...rect,
			} as DOMRect;
			anchor.getBoundingClientRect = () => filledRect;
			document.body.appendChild( anchor );
			return anchor;
		};

		const setViewport = ( width: number, height: number ) => {
			Object.defineProperty( window, 'innerWidth', { configurable: true, value: width } );
			Object.defineProperty( window, 'innerHeight', { configurable: true, value: height } );
		};

		beforeEach( () => {
			document.documentElement.dir = 'ltr';
			setViewport( 1280, 800 );
		} );

		afterEach( () => {
			document.body.innerHTML = '';
		} );

		const hasPixelValue = ( value: string ) => /^\d+(\.\d+)?px$/.test( value );

		it( 'should open upwards and align to inline-end when there is room above and to the end side', async () => {
			// Arrange.
			const container = mountContainer();
			const anchor = mountAnchor( { top: 700, right: 500, bottom: 720, left: 480 } );

			// Act.
			await openInlineTextGeneratorWithPrompt( anchor );

			// Assert.
			expect( container.style.getPropertyValue( 'position' ) ).toBe( 'fixed' );
			expect( container.style.getPropertyPriority( 'position' ) ).toBe( 'important' );
			expect( hasPixelValue( container.style.getPropertyValue( 'bottom' ) ) ).toBe( true );
			expect( hasPixelValue( container.style.getPropertyValue( 'inset-inline-end' ) ) ).toBe( true );
		} );

		it( 'should open downwards when there is not enough space above', async () => {
			// Arrange.
			const container = mountContainer();
			const anchor = mountAnchor( { top: 40, right: 900, bottom: 60, left: 880 } );

			// Act.
			await openInlineTextGeneratorWithPrompt( anchor );

			// Assert.
			expect( hasPixelValue( container.style.getPropertyValue( 'top' ) ) ).toBe( true );
			expect( hasPixelValue( container.style.getPropertyValue( 'bottom' ) ) ).toBe( false );
		} );

		it( 'should align to inline-start when there is not enough space on the inline-end side', async () => {
			// Arrange.
			const container = mountContainer();
			const anchor = mountAnchor( { top: 700, right: 1270, bottom: 720, left: 1250 } );

			// Act.
			await openInlineTextGeneratorWithPrompt( anchor );

			// Assert.
			expect( hasPixelValue( container.style.getPropertyValue( 'inset-inline-start' ) ) ).toBe( true );
			expect( hasPixelValue( container.style.getPropertyValue( 'inset-inline-end' ) ) ).toBe( false );
		} );

		it( 'should flip inline placement in RTL when there is not enough inline-end space', async () => {
			// Arrange.
			document.documentElement.dir = 'rtl';
			const container = mountContainer();
			const anchor = mountAnchor( { top: 700, right: 20, bottom: 720, left: 0 } );

			// Act.
			await openInlineTextGeneratorWithPrompt( anchor );

			// Assert.
			expect( hasPixelValue( container.style.getPropertyValue( 'inset-inline-start' ) ) ).toBe( true );
			expect( hasPixelValue( container.style.getPropertyValue( 'inset-inline-end' ) ) ).toBe( false );
		} );
	} );

	it( 'should disable the SDK toggle button injection', () => {
		// Act.
		const options = getInlineTextGeneratorLoadSidebarOptions();

		// Assert.
		expect( options.container?.chatToggleButton?.enabled ).toBe( false );
	} );

	it( 'should use stable app and instance ids in load sidebar options', () => {
		// Act.
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
		mockRegisterServer.mockRejectedValueOnce( new Error( 'boot failed' ) );

		// Act.
		await expect( bootInlineTextGeneratorSdk() ).rejects.toThrow( 'boot failed' );
		mockRegisterServer.mockResolvedValue( undefined );
		await bootInlineTextGeneratorSdk();

		// Assert.
		expect( mockCreateAngieMcpSdkInstance ).toHaveBeenCalledTimes( 2 );
	} );
} );
