import { omitPropsByMeta } from 'elementor-editor-utils/omit-props-by-meta';

describe( 'omitPropsByMeta', () => {
	beforeEach( () => {
		global.elementor = {
			widgetsCache: {
				'e-form': {
					atomic_props_schema: {
						prop_a: { kind: 'plain', key: 'string', meta: { sensitive: true } },
						prop_b: { kind: 'plain', key: 'string', meta: { export: false } },
						title: { kind: 'plain', key: 'string', meta: {} },
					},
				},
				'e-heading': {
					atomic_props_schema: {
						prop_a: { kind: 'plain', key: 'string', meta: { sensitive: true } },
						tag: { kind: 'plain', key: 'string', meta: [] },
					},
				},
			},
		};
	} );

	afterEach( () => {
		delete global.elementor;
	} );

	it( 'should omit props by schema meta in nested elements', () => {
		// Arrange.
		const data = {
			id: 'container-1',
			elType: 'e-div-block',
			settings: { prop_a: 'value-a' },
			elements: [
				{
					id: 'form-1',
					elType: 'e-form',
					settings: { prop_a: 'value-a', prop_b: 'value-b', title: 'Form' },
					elements: [
						{
							id: 'heading-1',
							elType: 'widget',
							widgetType: 'e-heading',
							settings: { prop_a: 'value-a', tag: 'h2' },
							elements: [],
						},
					],
				},
			],
		};

		// Act.
		const result = omitPropsByMeta( data );

		// Assert.
		expect( result ).toEqual( {
			id: 'container-1',
			elType: 'e-div-block',
			settings: { prop_a: 'value-a' },
			elements: [
				{
					id: 'form-1',
					elType: 'e-form',
					settings: { prop_b: 'value-b', title: 'Form' },
					elements: [
						{
							id: 'heading-1',
							elType: 'widget',
							widgetType: 'e-heading',
							settings: { tag: 'h2' },
							elements: [],
						},
					],
				},
			],
		} );
	} );

	it( 'should not mutate the original data', () => {
		// Arrange.
		const data = { id: 'form-1', elType: 'e-form', settings: { prop_a: 'value-a' } };

		// Act.
		omitPropsByMeta( data );

		// Assert.
		expect( data.settings ).toEqual( { prop_a: 'value-a' } );
	} );

	it( 'should keep elements without a schema unchanged', () => {
		// Arrange.
		const data = { id: 'section-1', elType: 'section', settings: { prop_a: 'value-a' } };

		// Act.
		const result = omitPropsByMeta( data );

		// Assert.
		expect( result ).toEqual( data );
	} );

	it( 'should work when the widgets cache is not available', () => {
		// Arrange.
		delete global.elementor;

		const data = { id: 'form-1', elType: 'e-form', settings: { prop_a: 'value-a' }, elements: [] };

		// Act.
		const result = omitPropsByMeta( data );

		// Assert.
		expect( result ).toEqual( data );
	} );
} );
