describe( 'app/load command', () => {
	let Load, component;

	beforeEach( async () => {
		document.body.innerHTML = '';

		global.$e = {
			run: jest.fn(),
			modules: {
				CommandBase: class CommandBase {
					constructor() {
						this.component = component;
					}
				},
			},
		};

		component = {
			iframe: null,
			backdrop: null,
		};

		Load = ( await import( 'elementor/app/assets/js/loader/commands/load' ) ).Load;
	} );

	afterEach( () => {
		delete global.$e;
		jest.resetModules();
		jest.clearAllMocks();
	} );

	it( 'should create backdrop and iframe on first call', () => {
		const cmd = new Load();
		cmd.apply( { url: 'http://example.com/app' } );

		expect( component.backdrop ).not.toBeNull();
		expect( component.backdrop.className ).toBe( 'elementor-app-backdrop' );
		expect( component.backdrop.style.display ).toBe( 'none' );
		expect( document.body.contains( component.backdrop ) ).toBe( true );

		expect( component.iframe ).not.toBeNull();
		expect( component.iframe.className ).toBe( 'elementor-app-iframe' );
		expect( component.iframe.style.display ).toBe( 'none' );
		expect( document.body.contains( component.iframe ) ).toBe( true );
	} );

	it( 'should set iframe src from args', () => {
		const cmd = new Load();
		cmd.apply( { url: 'http://example.com/app' } );

		expect( component.iframe.src ).toBe( 'http://example.com/app' );
	} );

	it( 'should not recreate iframe on subsequent calls', () => {
		const cmd = new Load();
		cmd.apply( { url: 'http://example.com/app' } );

		const firstIframe = component.iframe;
		const firstBackdrop = component.backdrop;

		cmd.apply( { url: 'http://example.com/app2' } );

		expect( component.iframe ).toBe( firstIframe );
		expect( component.backdrop ).toBe( firstBackdrop );
	} );

	it( 'should skip if url matches current src', () => {
		const cmd = new Load();
		cmd.apply( { url: 'http://example.com/app' } );

		component.iframe.src = 'http://example.com/app';
		const setSrcSpy = jest.spyOn( component.iframe, 'src', 'set' );

		cmd.apply( { url: 'http://example.com/app' } );

		expect( setSrcSpy ).not.toHaveBeenCalled();
	} );

	it( 'should add visible classes on iframe load event', () => {
		const cmd = new Load();
		cmd.apply( { url: 'http://example.com/app' } );

		component.iframe.dispatchEvent( new Event( 'load' ) );

		expect( component.iframe.classList.contains( 'elementor-app-iframe--visible' ) ).toBe( true );
		expect( component.backdrop.classList.contains( 'elementor-app-backdrop--visible' ) ).toBe( true );
	} );

	it( 'should close app when backdrop is clicked', () => {
		const cmd = new Load();
		cmd.apply( { url: 'http://example.com/app' } );

		component.backdrop.click();

		expect( $e.run ).toHaveBeenCalledWith( 'app/close' );
	} );
} );
