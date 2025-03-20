import { createContainer, addChildToContainer, setGlobalContainers } from '../../utils/container';

describe( 'Regenerate local style IDs', () => {
	let createHook;

	let uniqueId = 0;

	beforeAll( async () => {
		global.elementorCommon = {
			helpers: {
				getUniqueId: () => ++uniqueId,
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

		const CreateElementHook = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/hooks/data/regenerate-local-style-ids/create-element' ) ).default;

		createHook = new CreateElementHook();
	} );

	afterAll( async () => {
		delete global.$e;
		delete global.elementor;
		delete global.elementorCommon;
	} );

	beforeEach( () => {
		global.$e.internal = jest.fn();
		uniqueId = 0;
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should detect all duplicated styled atomic widgets on create', async () => {
		// Arrange
		const initialContainerStyle = {
			...createMockStyle( 'e-widget1-1' ),
		};

		const initialStyle = {
			...createMockStyle( 'e-widget2-1' ),
			...createMockStyle( 'e-widget2-2' ),
		};

		const initialNestedStyle = {
			...createMockStyle( 'e-widget3-1' ),
		};

		const container = createContainer( {
			widgetType: 'div-block',
			elType: 'div-block',
			id: 'widget1',
			styles: initialContainerStyle,
			settings: {
				classes: createMockClassPropValue( 'e-widget1-1' ),
			},
		} );

		const styledElement = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: 'widget2',
			styles: initialStyle,
			settings: {
				classes1: createMockClassPropValue( 'e-widget2-1' ),
				classes2: createMockClassPropValue( 'e-widget2-2' ),
			},
		} );

		const nestedStyledElement = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: 'widget3',
			styles: initialNestedStyle,
			settings: {
				classes: createMockClassPropValue( 'e-widget3-1' ),
			},
		} );

		const duplicatedStyledElement = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: 'widget4',
			styles: initialStyle,
			settings: {
				classes1: createMockClassPropValue( 'e-widget2-1' ),
				classes2: createMockClassPropValue( 'e-widget2-2' ),
			},
		} );

		const duplicatedNestedStyledElement = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: 'widget5',
			styles: initialNestedStyle,
			settings: {
				classes: createMockClassPropValue( 'e-widget3-1' ),
			},
		} );

		addChildToContainer( container, styledElement );
		addChildToContainer( styledElement, nestedStyledElement );
		addChildToContainer( container, duplicatedStyledElement );
		addChildToContainer( duplicatedStyledElement, duplicatedNestedStyledElement );
		setGlobalContainers( [ container, styledElement, nestedStyledElement, duplicatedStyledElement, duplicatedNestedStyledElement ] );

		const setSettingsCommand = jest.spyOn( global.$e, 'internal' );

		// Act
		createHook.apply( {}, [ duplicatedStyledElement ] );

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( initialContainerStyle );

		expect( styledElement.model.get( 'styles' ) ).toEqual( initialStyle );

		expect( nestedStyledElement.model.get( 'styles' ) ).toEqual( initialNestedStyle );

		expect( duplicatedStyledElement.model.get( 'styles' ) ).toEqual( {
			...createMockStyle( 'e-widget4-1' ),
			...createMockStyle( 'e-widget4-2' ),
		} );

		expect( duplicatedNestedStyledElement.model.get( 'styles' ) ).toEqual( {
			...createMockStyle( 'e-widget5-3' ),
		} );

		expect( setSettingsCommand ).toBeCalledWith( 'document/elements/set-settings', {
			container: duplicatedStyledElement,
			settings: {
				classes1: createMockClassPropValue( 'e-widget4-1' ),
				classes2: createMockClassPropValue( 'e-widget4-2' ),
			},
		} );

		expect( setSettingsCommand ).toBeCalledWith( 'document/elements/set-settings', {
			container: duplicatedNestedStyledElement,
			settings: {
				classes: createMockClassPropValue( 'e-widget5-3' ),
			},
		} );
	} );

	it( 'should not do anything if no styled elements are duplicated on create', async () => {
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
		createHook.apply( {}, [ duplicatedNonStyledElement ] );

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
