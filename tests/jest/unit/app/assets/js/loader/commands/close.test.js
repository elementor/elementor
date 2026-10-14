describe( 'app/close command', () => {
	let Close, component;

	beforeEach( async () => {
		document.body.innerHTML = '';

		component = {
			iframe: null,
			backdrop: null,
			close: jest.fn( () => true ),
		};

		global.$e = {
			modules: {
				CommandBase: class CommandBase {
					constructor() {
						this.component = component;
					}
				},
			},
		};

		Close = ( await import( 'elementor/app/assets/js/loader/commands/close' ) ).Close;
	} );

	afterEach( () => {
		delete global.$e;
		jest.resetModules();
		jest.clearAllMocks();
	} );

	it( 'should remove iframe and backdrop from DOM', () => {
		const iframe = document.createElement( 'iframe' );
		const backdrop = document.createElement( 'div' );
		document.body.appendChild( iframe );
		document.body.appendChild( backdrop );

		component.iframe = iframe;
		component.backdrop = backdrop;

		const cmd = new Close();
		cmd.apply();

		expect( document.body.contains( iframe ) ).toBe( false );
		expect( document.body.contains( backdrop ) ).toBe( false );
		expect( component.iframe ).toBeNull();
		expect( component.backdrop ).toBeNull();
	} );

	it( 'should restore body overflow', () => {
		document.body.style.overflow = 'hidden';

		const iframe = document.createElement( 'iframe' );
		document.body.appendChild( iframe );
		component.iframe = iframe;

		const cmd = new Close();
		cmd.apply();

		expect( document.body.style.overflow ).toBe( '' );
	} );

	it( 'should handle missing backdrop gracefully', () => {
		const iframe = document.createElement( 'iframe' );
		document.body.appendChild( iframe );
		component.iframe = iframe;
		component.backdrop = null;

		const cmd = new Close();

		expect( () => cmd.apply() ).not.toThrow();
		expect( component.iframe ).toBeNull();
	} );

	it( 'should return false if component.close() fails', () => {
		component.close = jest.fn( () => false );
		component.iframe = document.createElement( 'iframe' );

		const cmd = new Close();
		const result = cmd.apply();

		expect( result ).toBe( false );
	} );
} );
