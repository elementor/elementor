import { createContainer, addChildToContainer } from '../../../create-container';
import { setGlobalContainers } from './utils/set-global-containers';

describe( 'Detect duplicated styles', () => {
	const hooks = {
		paste: null,
		duplicate: null,
		import: null,
	};

	const hookNames = [
		[ 'duplicate' ],
		[ 'paste' ],
		[ 'import' ],
	];

	beforeAll( async () => {
		global.elementorCommon = {
			helpers: {
				getUniqueId: () => 'new',
			},
		};

		global.elementor = {
			widgetsCache: {
				'a-heading': {
					atomic_props_schema: {
						classes: {
							kind: 'plain',
							key: 'classes',
							default: [],
						},
					},
				},
				'div-block': {
					atomic_props_schema: {
						classes: {
							kind: 'plain',
							key: 'classes',
							default: [],
						},
					},
				},
			},
		};

		global.$e = {
			modules: {
				hookData: {
					After: class {},
				},
				editor: {
					CommandContainerInternalBase: class {
					},
				},
			},
		};

		const DuplicateElementHook = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/hooks/data/duplicated-styles/duplicate-element' ) ).default;
		const PasteElementHook = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/hooks/data/duplicated-styles/paste-element' ) ).default;
		const ImportElementHook = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/hooks/data/duplicated-styles/import-element' ) ).default;

		hooks.paste = new PasteElementHook();
		hooks.duplicate = new DuplicateElementHook();
		hooks.import = new ImportElementHook();
	} );

	afterAll( async () => {
		delete global.$e;
		delete global.elementor;
		delete global.elementorCommon;
	} );

	beforeEach( () => {
		global.$e.internal = jest.fn();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it.each( hookNames )( 'should detect all duplicated styled atomic widgets on %s', async ( hook ) => {
		// Arrange
		const container = createContainer( {
			widgetType: 'div-block',
			elType: 'div-block',
			id: 'widget1',
			styles: createMockStyle( 's-widget1-1' ),
			settings: {
				classes: createMockClassPropValue( 's-widget1-1' ),
			},
		} );

		const styledElement = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: 'widget2',
			styles: createMockStyle( 's-widget2-1' ),
			settings: {
				classes: createMockClassPropValue( 's-widget2-1' ),
			},
		} );

		const nestedStyledElement = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: 'widget3',
			styles: createMockStyle( 's-widget3-1' ),
			settings: {
				classes: createMockClassPropValue( 's-widget3-1' ),
			},
		} );

		const duplicatedStyledElement = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: 'widget4',
			styles: createMockStyle( 's-widget2-1' ),
			settings: {
				classes: createMockClassPropValue( 's-widget2-1' ),
			},
		} );

		const duplicatedNestedStyledElement = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: 'widget5',
			styles: createMockStyle( 's-widget3-1' ),
			settings: {
				classes: createMockClassPropValue( 's-widget3-1' ),
			},
		} );

		addChildToContainer( container, styledElement );
		addChildToContainer( styledElement, nestedStyledElement );
		addChildToContainer( container, duplicatedStyledElement );
		addChildToContainer( duplicatedStyledElement, duplicatedNestedStyledElement );
		setGlobalContainers( [ container, styledElement, nestedStyledElement, duplicatedStyledElement, duplicatedNestedStyledElement ] );

		const setSettingsCommand = jest.spyOn( global.$e, 'internal' );

		// Act
		hooks[ hook ].apply( {}, [ duplicatedStyledElement ] );

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( createMockStyle( 's-widget1-1' ) );

		expect( styledElement.model.get( 'styles' ) ).toEqual( createMockStyle( 's-widget2-1' ) );

		expect( nestedStyledElement.model.get( 'styles' ) ).toEqual( createMockStyle( 's-widget3-1' ) );

		expect( duplicatedStyledElement.model.get( 'styles' ) ).toEqual( createMockStyle( 's-widget4-new' ) );

		expect( duplicatedNestedStyledElement.model.get( 'styles' ) ).toEqual( createMockStyle( 's-widget5-new' ) );

		expect( setSettingsCommand ).toBeCalledWith( 'document/elements/set-settings', {
			container: duplicatedStyledElement,
			settings: {
				classes: createMockClassPropValue( 's-widget4-new' ),
			},
		} );

		expect( setSettingsCommand ).toBeCalledWith( 'document/elements/set-settings', {
			container: duplicatedNestedStyledElement,
			settings: {
				classes: createMockClassPropValue( 's-widget5-new' ),
			},
		} );
	} );

	it.each( hookNames )( 'should not do anything if no styled elements are duplicated on %s', async ( hook ) => {
		// Arrange
		const container = createContainer( {
			widgetType: 'div-block',
			elType: 'div-block',
			id: '123',
			styles: {},
			settings: {
				classes: {
					$$type: 'classes',
					value: [],
				},
			},
		} );

		const nonStyledElement = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '456',
			styles: {},
			settings: {
				classes: {
					$$type: 'classes',
					value: [],
				},
			},
		} );

		const duplicatedNonStyledElement = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '567',
			styles: {},
			settings: {
				classes: {
					$$type: 'classes',
					value: [],
				},
			},
		} );

		addChildToContainer( container, nonStyledElement );
		addChildToContainer( container, duplicatedNonStyledElement );
		setGlobalContainers( [ container, nonStyledElement, duplicatedNonStyledElement ] );

		const setSettingsCommand = jest.spyOn( global.$e, 'internal' );

		// Act
		hooks[ hook ].apply( {}, [ duplicatedNonStyledElement ] );

		// Assert
		expect( setSettingsCommand ).not.toBeCalled();
	} );
} );

const createMockStyle = ( id ) => ( {
	[ id ]: {
		id,
		label: 'Local',
		type: 'class',
		variants: [],
	},
} );

const createMockClassPropValue = ( id ) => ( {
	$$type: 'classes',
	value: [ id ],
} );
