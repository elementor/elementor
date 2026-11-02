import { renderLayoutApp } from 'elementor/modules/ai/assets/js/editor/utils/editor-integration';

jest.mock( 'elementor/modules/ai/assets/js/editor/utils/editor-integration', () => ( {
	__esModule: true,
	renderLayoutApp: jest.fn(),
	importToEditor: jest.fn(),
} ) );

jest.mock( 'elementor/modules/ai/assets/js/editor/ai-layout-behavior', () => class {} );

jest.mock( 'elementor/modules/ai/assets/js/editor/integration/library/apply-template-for-ai-behavior', () => class {} );

jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-layout/components/attachments', () => ( {
	__esModule: true,
	ELEMENTOR_LIBRARY_SOURCE: 'elementor-library',
	USER_VARIATION_SOURCE: 'user-variation',
} ) );

jest.mock( 'elementor/modules/ai/assets/js/editor/pages/form-layout/context/config', () => ( {
	__esModule: true,
	MODE_VARIATION: 'variation',
} ) );

describe( 'AI layout module - variations context menu', () => {
	let Module;

	beforeEach( async () => {
		global.elementorModules = {
			editor: {
				utils: {
					Module: class {},
				},
			},
		};

		global.elementor = {
			widgetsCache: {
				'e-form': {
					atomic_props_schema: {
						prop_a: { kind: 'plain', key: 'string', meta: { sensitive: true } },
						title: { kind: 'plain', key: 'string', meta: {} },
					},
				},
			},
		};

		// Need to import dynamically since the module extends a global variable which isn't available in regular import.
		Module = ( await import( 'elementor/modules/ai/assets/js/editor/layout-module' ) ).default;
	} );

	afterEach( () => {
		delete global.elementorModules;
		delete global.elementor;

		jest.clearAllMocks();
	} );

	it( 'should apply prop meta to the attached element data', async () => {
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

		const container = {
			children: [ {} ],
			parent: {},
			view: { _index: 0, $el: { hide: jest.fn(), show: jest.fn() } },
			model: {
				toJSON: jest.fn( () => containerData ),
				get: () => 'Container',
			},
		};

		const groups = [ { name: 'save', actions: [] } ];

		const module = new Module();

		// Act.
		module.registerVariationsContextMenu( groups, { getContainer: () => container } );

		await groups[ 0 ].actions[ 0 ].callback();

		// Assert.
		const [ { attachments } ] = renderLayoutApp.mock.calls[ 0 ];

		expect( attachments[ 0 ].content ).toEqual( {
			...containerData,
			elements: [ { ...formData, settings: { title: 'Form' } } ],
		} );

		expect( formData.settings ).toHaveProperty( 'prop_a' );
	} );
} );
