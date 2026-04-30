import { createV4FlexboxFromPreset } from 'elementor-editor-utils/v4-flexbox-preset';

const sizeProp = ( size, unit ) => ( { $$type: 'size', value: { size, unit } } );
const stringProp = ( value ) => ( { $$type: 'string', value } );

const ROW = stringProp( 'row' );
const WRAP = stringProp( 'wrap' );
const ZERO_PX = sizeProp( 0, 'px' );

function makeFakeContainer( id = `c-${ Math.random().toString( 36 ).slice( 2 ) }` ) {
	const modelStore = { styles: {} };
	const settingsStore = { classes: undefined };

	return {
		id,
		model: {
			get: ( key ) => modelStore[ key ],
			set: ( key, value ) => {
				modelStore[ key ] = value;
			},
		},
		settings: {
			get: ( key ) => settingsStore[ key ],
		},
		_styles: modelStore,
		_settings: settingsStore,
	};
}

describe( 'createV4FlexboxFromPreset', () => {
	let createdContainers;
	let createCalls;
	let setSettingsCalls;
	let historyEvents;
	let uniqueCounter;
	let originalEnv;

	beforeEach( () => {
		createdContainers = [];
		createCalls = [];
		setSettingsCalls = [];
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
					createCalls.push( { target: args.container, model: args.model, options: args.options } );
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
				if ( 'document/elements/set-settings' === command ) {
					setSettingsCalls.push( {
						containerId: args.container.id,
						classes: args.settings.classes,
					} );
					args.container._settings.classes = args.settings.classes;
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

	function lastStyleOn( container ) {
		const styles = container._styles.styles;
		const keys = Object.keys( styles );
		return styles[ keys[ keys.length - 1 ] ];
	}

	function getProps( container ) {
		const style = lastStyleOn( container );
		return style?.variants[ 0 ]?.props;
	}

	test( 'wraps the work in a history start/end log', () => {
		createV4FlexboxFromPreset( 'c100', makeFakeContainer( 'target' ), {} );

		expect( historyEvents.find( ( e ) => 'start' === e.type ) ).toBeDefined();
		expect( historyEvents.find( ( e ) => 'end' === e.type ) ).toBeDefined();
		expect( historyEvents.find( ( e ) => 'delete' === e.type ) ).toBeUndefined();
	} );

	test( 'c100 → 1 e-flexbox, no overrides (column is the default)', () => {
		const target = makeFakeContainer( 'target' );

		createV4FlexboxFromPreset( 'c100', target, {} );

		expect( createCalls ).toHaveLength( 1 );
		expect( createCalls[ 0 ].model ).toEqual( { elType: 'e-flexbox' } );
		expect( createCalls[ 0 ].target ).toBe( target );
		expect( setSettingsCalls ).toHaveLength( 0 );
		expect( createdContainers[ 0 ]._styles.styles ).toEqual( {} );
	} );

	test( 'r100 → 1 e-flexbox with flex-direction: row', () => {
		createV4FlexboxFromPreset( 'r100', makeFakeContainer( 'target' ), {} );

		expect( createCalls ).toHaveLength( 1 );
		expect( getProps( createdContainers[ 0 ] ) ).toEqual( {
			'flex-direction': ROW,
		} );
	} );

	test( '50-50 → row parent (no wrap) + 2 children at 50%', () => {
		createV4FlexboxFromPreset( '50-50', makeFakeContainer( 'target' ), {} );

		expect( createCalls ).toHaveLength( 3 );

		const [ parent, c1, c2 ] = createdContainers;

		expect( getProps( parent ) ).toEqual( {
			'flex-direction': ROW,
			gap: ZERO_PX,
		} );
		expect( getProps( c1 ) ).toEqual( { width: sizeProp( 50, '%' ) } );
		expect( getProps( c2 ) ).toEqual( { width: sizeProp( 50, '%' ) } );
	} );

	test( '33-66 → maps 33/66 to 33.3333 / 66.6666', () => {
		createV4FlexboxFromPreset( '33-66', makeFakeContainer( 'target' ), {} );

		const [ , c1, c2 ] = createdContainers;
		expect( getProps( c1 ).width ).toEqual( sizeProp( 33.3333, '%' ) );
		expect( getProps( c2 ).width ).toEqual( sizeProp( 66.6666, '%' ) );
	} );

	test( '50-50-50-50 → row parent with flex-wrap: wrap (sum > 100)', () => {
		createV4FlexboxFromPreset( '50-50-50-50', makeFakeContainer( 'target' ), {} );

		const [ parent, ...children ] = createdContainers;

		expect( getProps( parent ) ).toEqual( {
			'flex-direction': ROW,
			gap: ZERO_PX,
			'flex-wrap': WRAP,
		} );
		expect( children ).toHaveLength( 4 );
		children.forEach( ( child ) => {
			expect( getProps( child ).width ).toEqual( sizeProp( 50, '%' ) );
		} );
	} );

	test( 'c100-c50-50 → row parent + left child + right wrapper + 2 grandchildren', () => {
		createV4FlexboxFromPreset( 'c100-c50-50', makeFakeContainer( 'target' ), {} );

		expect( createCalls ).toHaveLength( 5 );

		const [ parent, leftCol, rightCol, gc1, gc2 ] = createdContainers;

		expect( getProps( parent ) ).toEqual( {
			'flex-direction': ROW,
			gap: ZERO_PX,
		} );

		expect( getProps( leftCol ) ).toEqual( { width: sizeProp( 50, '%' ) } );

		expect( getProps( rightCol ) ).toEqual( {
			width: sizeProp( 50, '%' ),
			padding: ZERO_PX,
			gap: ZERO_PX,
		} );

		expect( gc1._styles.styles ).toEqual( {} );
		expect( gc2._styles.styles ).toEqual( {} );

		expect( createCalls[ 3 ].target ).toBe( rightCol );
		expect( createCalls[ 4 ].target ).toBe( rightCol );
	} );

	test( 'createWrapper:false → applies parent style to the existing target instead of creating a wrapper', () => {
		const target = makeFakeContainer( 'target' );

		createV4FlexboxFromPreset( '50-50', target, { createWrapper: false } );

		expect( createCalls ).toHaveLength( 2 );

		expect( getProps( target ) ).toEqual( {
			'flex-direction': ROW,
			gap: ZERO_PX,
		} );

		createCalls.forEach( ( call ) => {
			expect( call.target ).toBe( target );
		} );
	} );

	test( 'each created element gets its style id pushed into the classes setting', () => {
		createV4FlexboxFromPreset( '50-50', makeFakeContainer( 'target' ), {} );

		expect( setSettingsCalls ).toHaveLength( 3 );

		setSettingsCalls.forEach( ( call ) => {
			expect( call.classes.$$type ).toBe( 'classes' );
			expect( call.classes.value ).toHaveLength( 1 );
			expect( call.classes.value[ 0 ] ).toMatch( /^e-c-[a-z0-9-]+-u\d+$/ );
		} );
	} );

	test( 'unknown preset falls through to createFlexboxFromSizes (split by "-")', () => {
		createV4FlexboxFromPreset( '25-25-25-25', makeFakeContainer( 'target' ), {} );

		expect( createCalls ).toHaveLength( 5 );

		const children = createdContainers.slice( 1 );
		children.forEach( ( child ) => {
			expect( getProps( child ).width ).toEqual( sizeProp( 25, '%' ) );
		} );
	} );

	test( 'falls back to elementor.getPreviewContainer() when target is omitted', () => {
		const previewContainer = makeFakeContainer( 'document' );
		global.elementor.getPreviewContainer = () => previewContainer;

		createV4FlexboxFromPreset( 'c100' );

		expect( createCalls[ 0 ].target ).toBe( previewContainer );
	} );
} );
