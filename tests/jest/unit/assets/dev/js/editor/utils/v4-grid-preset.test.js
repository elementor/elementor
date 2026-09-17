import { createV4GridFromPreset } from 'elementor-editor-utils/v4-grid-preset';

const gridTrackSizeProp = ( size ) => ( {
	$$type: 'grid-track-size',
	value: { size: Number( size ), unit: 'fr' },
} );

function makeFakeContainer( id = `c-${ Math.random().toString( 36 ).slice( 2 ) }` ) {
	return { id };
}

describe( 'createV4GridFromPreset', () => {
	let createCalls;
	let historyEvents;
	let uniqueCounter;
	let originalEnv;

	beforeEach( () => {
		createCalls = [];
		historyEvents = [];
		uniqueCounter = 0;

		originalEnv = {
			elementor: global.elementor,
			elementorCommon: global.elementorCommon,
			$e: global.$e,
		};

		global.elementor = {
			getPreviewContainer: () => makeFakeContainer( 'document' ),
			presetsFactory: {
				getParsedGridStructure: ( structure ) => {
					const chunks = String( structure ).split( '-' );

					return {
						rows: chunks[ 0 ],
						columns: chunks[ 1 ],
					};
				},
			},
		};

		global.elementorCommon = {
			helpers: {
				getUniqueId: () => `u${ ++uniqueCounter }`,
			},
		};

		global.$e = {
			...global.$e,
			run: jest.fn( ( command, args ) => {
				if ( 'document/elements/create' === command ) {
					createCalls.push( { target: args.container, model: args.model, args } );
					return makeFakeContainer();
				}
				return undefined;
			} ),
			internal: jest.fn( ( command, args ) => {
				if ( 'document/history/start-log' === command ) {
					historyEvents.push( { type: 'start', args } );
					return 'history-id';
				}
				if ( 'document/history/end-log' === command ) {
					historyEvents.push( { type: 'end', id: args.id } );
				}
				if ( 'document/history/delete-log' === command ) {
					historyEvents.push( { type: 'delete', id: args.id } );
				}
				return undefined;
			} ),
		};
	} );

	afterEach( () => {
		global.elementor = originalEnv.elementor;
		global.elementorCommon = originalEnv.elementorCommon;
		global.$e = originalEnv.$e;
	} );

	function getModel( index = 0 ) {
		return createCalls[ index ].model;
	}

	function getVariants( model ) {
		const styleIds = Object.keys( model.styles ?? {} );
		const lastId = styleIds[ styleIds.length - 1 ];
		return model.styles?.[ lastId ]?.variants;
	}

	function getDesktopProps( model ) {
		return getVariants( model )?.[ 0 ]?.props;
	}

	function getMobileProps( model ) {
		return getVariants( model )?.[ 1 ]?.props;
	}

	const GRID_PRESETS = [
		{ structure: '1-2', rows: 1, columns: 2 },
		{ structure: '2-1', rows: 2, columns: 1 },
		{ structure: '1-3', rows: 1, columns: 3 },
		{ structure: '3-1', rows: 3, columns: 1 },
		{ structure: '2-2', rows: 2, columns: 2 },
		{ structure: '2-3', rows: 2, columns: 3 },
	];

	test.each( GRID_PRESETS )( '$structure → e-grid with numeric $rows rows and $columns columns', ( { structure, rows, columns } ) => {
		createV4GridFromPreset( structure, makeFakeContainer( 'target' ), {} );

		expect( createCalls ).toHaveLength( 1 );

		const model = getModel( 0 );
		expect( model.elType ).toBe( 'e-grid' );
		expect( model.elements ).toEqual( [] );

		const desktopProps = getDesktopProps( model );
		expect( desktopProps[ 'grid-template-columns' ] ).toEqual( gridTrackSizeProp( columns ) );
		expect( desktopProps[ 'grid-template-rows' ] ).toEqual( gridTrackSizeProp( rows ) );
		expect( typeof desktopProps[ 'grid-template-columns' ].value.size ).toBe( 'number' );
		expect( typeof desktopProps[ 'grid-template-rows' ].value.size ).toBe( 'number' );

		const mobileProps = getMobileProps( model );
		expect( mobileProps[ 'grid-template-columns' ] ).toEqual( gridTrackSizeProp( 1 ) );
		expect( mobileProps[ 'grid-template-rows' ] ).toEqual( gridTrackSizeProp( rows ) );
	} );

	test( 'settings.classes references the generated style id', () => {
		createV4GridFromPreset( '1-2', makeFakeContainer( 'target' ), {} );

		const model = getModel( 0 );
		const styleId = Object.keys( model.styles )[ 0 ];
		expect( model.settings.classes ).toEqual( { $$type: 'classes', value: [ styleId ] } );
	} );

	test( 'variants include desktop and mobile breakpoints', () => {
		createV4GridFromPreset( '2-2', makeFakeContainer( 'target' ), {} );

		const variants = getVariants( getModel( 0 ) );
		expect( variants ).toHaveLength( 2 );
		expect( variants[ 0 ].meta ).toEqual( { breakpoint: 'desktop', state: null } );
		expect( variants[ 1 ].meta ).toEqual( { breakpoint: 'mobile', state: null } );
	} );

	// Regression test for ED-24385.
	test( 'root options (e.g. `at`) are forwarded to `document/elements/create` nested under `options`, not spread', () => {
		createV4GridFromPreset( '1-2', makeFakeContainer( 'target' ), {
			at: 2,
			edit: false,
		} );

		const rootCallArgs = createCalls[ 0 ].args;

		expect( rootCallArgs.options ).toEqual( { at: 2, edit: false } );
		expect( rootCallArgs.at ).toBeUndefined();
		expect( rootCallArgs.edit ).toBeUndefined();
	} );

	test( 'rolls back history when element creation throws', () => {
		global.$e.run = jest.fn( ( command ) => {
			if ( 'document/elements/create' === command ) {
				throw new Error( 'create failed' );
			}
			return undefined;
		} );

		expect( () => createV4GridFromPreset( '1-2', makeFakeContainer( 'target' ), {} ) ).not.toThrow();

		expect( historyEvents.find( ( e ) => 'start' === e.type ) ).toBeDefined();
		expect( historyEvents.find( ( e ) => 'delete' === e.type ) ).toBeDefined();
		expect( historyEvents.find( ( e ) => 'end' === e.type ) ).toBeUndefined();
	} );
} );
