import { type StyleDefinition } from '@elementor/editor-styles';

import { prepareWidgetTemplateForInsert } from '../prepare-widget-template-for-insert';
import { type V1ElementData, type WidgetDefinitionForInsert } from '../types';

const GLOBAL_CLASS_ID = 'g-123abc';

const LOCAL_ROOT_STYLE = {
	id: 'local-root',
	type: 'class',
	label: 'local',
	variants: [
		{
			meta: { breakpoint: 'desktop', state: null },
			props: { padding: { $$type: 'size', value: { size: 12, unit: 'px' } } },
			custom_css: null,
		},
	],
} as StyleDefinition;

function createDefinition(): WidgetDefinitionForInsert {
	return {
		id: 'elementor/icon-button',
		version: 1,
		template: {
			elType: 'e-flexbox',
			part: 'root',
			settings: {
				classes: { $$type: 'classes', value: [ 'local-root', GLOBAL_CLASS_ID ] },
			},
			styles: { 'local-root': LOCAL_ROOT_STYLE },
			elements: [
				{ elType: 'widget', widgetType: 'e-svg', part: 'icon' },
				{
					elType: 'widget',
					widgetType: 'e-paragraph',
					part: 'label',
					settings: { paragraph: { $$type: 'escaped-html', value: 'Click me' } },
				},
			],
		},
	};
}

function collectIds( element: V1ElementData ): string[] {
	return [ element.id, ...( element.elements ?? [] ).flatMap( collectIds ) ];
}

describe( 'prepareWidgetTemplateForInsert', () => {
	let idCounter = 0;

	beforeEach( () => {
		idCounter = 0;

		( window as unknown as { elementorCommon: unknown } ).elementorCommon = {
			helpers: { getUniqueId: () => `id${ ++idCounter }` },
		};
	} );

	afterEach( () => {
		delete ( window as unknown as { elementorCommon?: unknown } ).elementorCommon;
	} );

	it( 'assigns a new unique id to every node', () => {
		// Arrange.
		const definition = createDefinition();

		// Act.
		const result = prepareWidgetTemplateForInsert( definition );

		// Assert.
		const ids = collectIds( result );

		expect( ids ).toHaveLength( 3 );
		expect( new Set( ids ).size ).toBe( ids.length );
		expect( result.elements?.every( ( child ) => Array.isArray( child.elements ) ) ).toBe( true );
	} );

	it( 'remaps local style placeholders to element-scoped ids and keeps global classes', () => {
		// Arrange.
		const definition = createDefinition();

		// Act.
		const result = prepareWidgetTemplateForInsert( definition );

		// Assert.
		const styleIds = Object.keys( result.styles ?? {} );

		expect( styleIds ).toHaveLength( 1 );
		expect( styleIds[ 0 ] ).toMatch( new RegExp( `^e-${ result.id }-.+$` ) );
		expect( result.styles?.[ styleIds[ 0 ] ].id ).toBe( styleIds[ 0 ] );
		expect( result.styles?.[ styleIds[ 0 ] ].variants ).toEqual( LOCAL_ROOT_STYLE.variants );
		expect( result.settings?.classes ).toEqual( {
			$$type: 'classes',
			value: [ styleIds[ 0 ], GLOBAL_CLASS_ID ],
		} );
	} );

	it( 'stamps the widget marker on the root only and keeps parts', () => {
		// Arrange.
		const definition = createDefinition();

		// Act.
		const result = prepareWidgetTemplateForInsert( definition );

		// Assert.
		expect( result.widget ).toEqual( { id: 'elementor/icon-button', version: 1, values: {} } );
		expect( result.part ).toBe( 'root' );
		expect( result.elements?.map( ( child ) => child.part ) ).toEqual( [ 'icon', 'label' ] );
		expect( result.elements?.some( ( child ) => 'widget' in child ) ).toBe( false );
	} );

	it( 'does not mutate the definition template', () => {
		// Arrange.
		const definition = createDefinition();
		const snapshot = structuredClone( definition );

		// Act.
		prepareWidgetTemplateForInsert( definition );

		// Assert.
		expect( definition ).toEqual( snapshot );
	} );

	it( 'returns different ids on every insert', () => {
		// Arrange.
		const definition = createDefinition();

		// Act.
		const first = prepareWidgetTemplateForInsert( definition );
		const second = prepareWidgetTemplateForInsert( definition );

		// Assert.
		expect( collectIds( first ) ).not.toEqual( collectIds( second ) );
		expect( Object.keys( first.styles ?? {} ) ).not.toEqual( Object.keys( second.styles ?? {} ) );
	} );
} );
