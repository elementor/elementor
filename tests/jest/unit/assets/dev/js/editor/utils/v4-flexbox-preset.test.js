import { createV4FlexboxFromPreset } from 'elementor-editor-utils/v4-flexbox-preset';

const sizeProp = ( size, unit ) => ( { $$type: 'size', value: { size, unit } } );
const stringProp = ( value ) => ( { $$type: 'string', value } );

const ROW = stringProp( 'row' );
const COLUMN = stringProp( 'column' );
const WRAP = stringProp( 'wrap' );
const ZERO_PX = sizeProp( 0, 'px' );

function makeFakeContainer( id = `c-${ Math.random().toString( 36 ).slice( 2 ) }` ) {
	return { id };
}

describe( 'createV4FlexboxFromPreset', () => {
	let createdContainers;
	let createCalls;
	let historyEvents;
	let uniqueCounter;
	let originalEnv;

	beforeEach( () => {
		createdContainers = [];
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
					const c = makeFakeContainer();
					createCalls.push( { target: args.container, model: args.model, args } );
					createdContainers.push( c );
					return c;
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

	function getModel( index ) {
		return createCalls[ index ].model;
	}

	function getProps( model ) {
		const styleIds = Object.keys( model.styles ?? {} );
		const lastId = styleIds[ styleIds.length - 1 ];
		return model.styles?.[ lastId ]?.variants?.[ 0 ]?.props;
	}

	function getVariants( model ) {
		const styleIds = Object.keys( model.styles ?? {} );
		const lastId = styleIds[ styleIds.length - 1 ];
		return model.styles?.[ lastId ]?.variants;
	}

	test( 'c100 → 1 e-flexbox with flex-direction:column overriding the row base style', () => {
		const target = makeFakeContainer( 'target' );

		createV4FlexboxFromPreset( 'c100', target, {} );

		expect( createCalls ).toHaveLength( 1 );
		expect( createCalls[ 0 ].target ).toBe( target );

		const model = getModel( 0 );
		expect( model.elType ).toBe( 'e-flexbox' );
		expect( getProps( model ) ).toEqual( { 'flex-direction': COLUMN } );
	} );

	test( 'r100 → flex-direction:row + matching classes setting baked into the model', () => {
		createV4FlexboxFromPreset( 'r100', makeFakeContainer( 'target' ), {} );

		const model = getModel( 0 );
		expect( model.elType ).toBe( 'e-flexbox' );
		expect( getProps( model ) ).toEqual( { 'flex-direction': ROW } );

		const styleId = Object.keys( model.styles )[ 0 ];
		expect( model.settings.classes ).toEqual( { $$type: 'classes', value: [ styleId ] } );
	} );

	test( '50-50 → row parent (no wrap) + 2 children at 50%, options spread to root', () => {
		createV4FlexboxFromPreset( '50-50', makeFakeContainer( 'target' ), {
			at: 0,
			edit: false,
		} );

		expect( createCalls ).toHaveLength( 3 );

		expect( getProps( getModel( 0 ) ) ).toEqual( { 'flex-direction': ROW } );
		expect( getProps( getModel( 1 ) ) ).toEqual( { 'flex-direction': COLUMN, width: sizeProp( 50, '%' ) } );
		expect( getProps( getModel( 2 ) ) ).toEqual( { 'flex-direction': COLUMN, width: sizeProp( 50, '%' ) } );

		expect( createCalls[ 0 ].args.at ).toBe( 0 );
		expect( createCalls[ 0 ].args.edit ).toBe( false );
		expect( createCalls[ 0 ].args.options ).toBeUndefined();
		expect( createCalls[ 1 ].args.at ).toBeUndefined();
	} );

	test( '33-66 → maps 33/66 to 33.3333 / 66.6666', () => {
		createV4FlexboxFromPreset( '33-66', makeFakeContainer( 'target' ), {} );

		expect( getProps( getModel( 1 ) ) ).toEqual( { 'flex-direction': COLUMN, width: sizeProp( 33.3333, '%' ) } );
		expect( getProps( getModel( 2 ) ) ).toEqual( { 'flex-direction': COLUMN, width: sizeProp( 66.6666, '%' ) } );
	} );

	test( '50-50-50-50 → row parent with flex-wrap: wrap (sum > 100)', () => {
		createV4FlexboxFromPreset( '50-50-50-50', makeFakeContainer( 'target' ), {} );

		expect( getProps( getModel( 0 ) ) ).toEqual( {
			'flex-direction': ROW,
			'flex-wrap': WRAP,
		} );
		expect( createCalls ).toHaveLength( 5 );
		for ( let i = 1; i <= 4; i++ ) {
			expect( getProps( getModel( i ) ) ).toEqual( { 'flex-direction': COLUMN, width: sizeProp( 50, '%' ) } );
		}
	} );

	test( 'c100-c50-50 → row parent + left child + right wrapper + 2 grandchildren', () => {
		createV4FlexboxFromPreset( 'c100-c50-50', makeFakeContainer( 'target' ), {} );

		expect( createCalls ).toHaveLength( 5 );

		const [ parent, , rightCol ] = createdContainers;

		expect( getProps( getModel( 0 ) ) ).toEqual( { 'flex-direction': ROW } );
		expect( getProps( getModel( 1 ) ) ).toEqual( { 'flex-direction': COLUMN, width: sizeProp( 50, '%' ) } );
		expect( getProps( getModel( 2 ) ) ).toEqual( {
			'flex-direction': COLUMN,
			width: sizeProp( 50, '%' ),
			padding: ZERO_PX,
		} );
		expect( getProps( getModel( 3 ) ) ).toEqual( { 'flex-direction': COLUMN } );
		expect( getProps( getModel( 4 ) ) ).toEqual( { 'flex-direction': COLUMN } );

		expect( createCalls[ 1 ].target ).toBe( parent );
		expect( createCalls[ 2 ].target ).toBe( parent );
		expect( createCalls[ 3 ].target ).toBe( rightCol );
		expect( createCalls[ 4 ].target ).toBe( rightCol );
	} );

	test( 'createWrapper:false → reuses target as parent, only children are created', () => {
		const target = makeFakeContainer( 'target' );

		createV4FlexboxFromPreset( '50-50', target, { createWrapper: false } );

		expect( createCalls ).toHaveLength( 2 );
		createCalls.forEach( ( call ) => {
			expect( call.target ).toBe( target );
		} );
	} );

	test( '50-50-50-50 → each child has a mobile variant overriding width to 100%', () => {
		createV4FlexboxFromPreset( '50-50-50-50', makeFakeContainer( 'target' ), {} );

		expect( getVariants( getModel( 0 ) ) ).toHaveLength( 1 );

		for ( let i = 1; i <= 4; i++ ) {
			const variants = getVariants( getModel( i ) );
			expect( variants ).toHaveLength( 2 );
			expect( variants[ 0 ].meta ).toEqual( { breakpoint: null, state: null } );
			expect( variants[ 0 ].props ).toEqual( { 'flex-direction': COLUMN, width: sizeProp( 50, '%' ) } );
			expect( variants[ 1 ].meta ).toEqual( { breakpoint: 'mobile', state: null } );
			expect( variants[ 1 ].props ).toEqual( { width: sizeProp( 100, '%' ) } );
		}
	} );

	test( 'c100-c50-50 → both 50% columns get a mobile width:100% variant', () => {
		createV4FlexboxFromPreset( 'c100-c50-50', makeFakeContainer( 'target' ), {} );

		const leftVariants = getVariants( getModel( 1 ) );
		expect( leftVariants ).toHaveLength( 2 );
		expect( leftVariants[ 1 ].meta ).toEqual( { breakpoint: 'mobile', state: null } );
		expect( leftVariants[ 1 ].props ).toEqual( { width: sizeProp( 100, '%' ) } );

		const rightVariants = getVariants( getModel( 2 ) );
		expect( rightVariants ).toHaveLength( 2 );
		expect( rightVariants[ 1 ].meta ).toEqual( { breakpoint: 'mobile', state: null } );
		expect( rightVariants[ 1 ].props ).toEqual( { width: sizeProp( 100, '%' ) } );
	} );

	test( 'rolls back history when element creation throws', () => {
		global.$e.run = jest.fn( ( command ) => {
			if ( 'document/elements/create' === command ) {
				throw new Error( 'create failed' );
			}
			return undefined;
		} );

		expect( () => createV4FlexboxFromPreset( '50-50', makeFakeContainer( 'target' ), {} ) ).not.toThrow();

		expect( historyEvents.find( ( e ) => 'start' === e.type ) ).toBeDefined();
		expect( historyEvents.find( ( e ) => 'delete' === e.type ) ).toBeDefined();
		expect( historyEvents.find( ( e ) => 'end' === e.type ) ).toBeUndefined();
	} );
} );
