describe( `$e.run( 'document/elements/copy' )`, () => {
	let Copy;
	let textarea;

	const createContainer = ( data, index ) => ( {
		view: { el: index },
		model: { toJSON: jest.fn( () => data ) },
	} );

	beforeEach( async () => {
		global.$e = {
			modules: {
				editor: {
					CommandContainerBase: class {},
				},
			},
		};

		global.elementor = {
			selection: { isSameType: () => true },
			notifications: { showToast: jest.fn() },
			getPreviewView: () => ( {
				$el: { find: () => ( { index: ( el ) => el } ) },
			} ),
			widgetsCache: {
				'e-form': {
					atomic_props_schema: {
						prop_a: { kind: 'plain', key: 'string', meta: { sensitive: true } },
						title: { kind: 'plain', key: 'string', meta: {} },
					},
				},
			},
		};

		global.elementorCommon = {
			config: { urls: { rest: 'https://example.com/wp-json/' } },
			storage: { set: jest.fn() },
		};

		textarea = { value: '', select: jest.fn() };

		jest.spyOn( document, 'createElement' ).mockReturnValue( textarea );
		jest.spyOn( document.body, 'appendChild' ).mockImplementation( () => textarea );
		jest.spyOn( document.body, 'removeChild' ).mockImplementation( () => textarea );
		document.execCommand = jest.fn( () => true );

		// Need to import dynamically since the command extends a global variable which isn't available in regular import.
		Copy = ( await import( 'elementor-document/elements/commands/copy' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementor;
		delete global.elementorCommon;

		jest.restoreAllMocks();
	} );

	it( 'should apply prop meta to the system clipboard data only', () => {
		// Arrange.
		const formData = {
			id: 'form-1',
			elType: 'e-form',
			settings: { prop_a: 'value-a', title: 'Form' },
			elements: [],
		};

		const containerData = {
			id: 'container-1',
			elType: 'e-div-block',
			settings: {},
			elements: [ formData ],
		};

		const command = new Copy();

		// Act.
		command.apply( { containers: [ createContainer( containerData, 0 ) ] } );

		// Assert.
		expect( elementorCommon.storage.set ).toHaveBeenCalledWith( 'clipboard', {
			type: 'elementor',
			siteurl: 'https://example.com/wp-json/',
			elements: [ containerData ],
		} );

		expect( JSON.parse( textarea.value ) ).toEqual( {
			type: 'elementor',
			siteurl: 'https://example.com/wp-json/',
			elements: [
				{
					...containerData,
					elements: [ { ...formData, settings: { title: 'Form' } } ],
				},
			],
		} );

		expect( document.execCommand ).toHaveBeenCalledWith( 'copy' );
	} );

	it( 'should keep elements without prop meta unchanged', () => {
		// Arrange.
		const sectionData = { id: 'section-1', elType: 'section', settings: { title: 'Section' }, elements: [] };

		const command = new Copy();

		// Act.
		command.apply( { containers: [ createContainer( sectionData, 0 ) ] } );

		// Assert.
		expect( JSON.parse( textarea.value ).elements ).toEqual( [ sectionData ] );
	} );
} );
