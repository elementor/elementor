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
				getUniqueId: () => 'random',
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

		const SetSettingsCommand = ( await import( 'elementor-document/elements/commands-internal/set-settings' ) ).default;

		hooks.paste = new PasteElementHook();
		hooks.duplicate = new DuplicateElementHook();
		hooks.import = new ImportElementHook();

		global.$e.internal = ( command, args ) => {
			switch ( command ) {
				case 'document/elements/set-settings':
					return new SetSettingsCommand().apply( args );
			}
		};
	} );

	afterAll( async () => {
		delete global.$e;
		delete global.elementor;
		delete global.elementorCommon;
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it.each( hookNames )( 'should detect all duplicated styled atomic widgets on %d', async ( hook ) => {
		// Arrange
		const styledElement = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '456',
			styles: {
				's-456-1': {
					id: 's-456-1',
					label: '',
					type: 'class',
					variants: [],
				},
			},
			settings: {
				classes: {
					$$type: 'classes',
					value: [ 's-456-1' ],
				},
			},
		} );

		const duplicatedStyledElement = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '567',
			styles: {
				's-456-1': {
					id: 's-456-1',
					label: '',
					type: 'class',
					variants: [],
				},
			},
			settings: {
				classes: {
					$$type: 'classes',
					value: [ 's-456-1' ],
				},
			},
		} );

		const container = createContainer( {
			widgetType: 'div-block',
			elType: 'div-block',
			id: '123',
			styles: {
				's-123-1': {
					id: 's-123-1',
					label: '',
					type: 'class',
					variants: [],
				},
			},
			settings: {
				classes: {
					$$type: 'classes',
					value: [ 's-123-1' ],
				},
			},
		} );

		const nestedStyledElement = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '678',
			styles: {
				's-678-1': {
					id: 's-678-1',
					label: '',
					type: 'class',
					variants: [],
				},
			},
			settings: {
				classes: {
					$$type: 'classes',
					value: [ 's-678-1' ],
				},
			},
		} );

		addChildToContainer( duplicatedStyledElement, nestedStyledElement );
		addChildToContainer( container, styledElement );
		addChildToContainer( container, duplicatedStyledElement );
		setGlobalContainers( [ container, styledElement, duplicatedStyledElement, nestedStyledElement ] );

		const setSettingsCommand = jest.spyOn( global.$e, 'internal' );

		// Act
		hooks[ hook ].apply( {}, [ duplicatedStyledElement ] );

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( {
			's-123-1': {
				id: 's-123-1',
				label: '',
				type: 'class',
				variants: [],
			},
		} );

		expect( styledElement.model.get( 'styles' ) ).toEqual( {
			's-456-1': {
				id: 's-456-1',
				label: '',
				type: 'class',
				variants: [],
			},
		} );

		expect( duplicatedStyledElement.model.get( 'styles' ) ).toEqual( {
			's-567-random': {
				id: 's-567-random',
				label: '',
				type: 'class',
				variants: [],
			},
		} );

		expect( nestedStyledElement.model.get( 'styles' ) ).toEqual( {
			's-678-random': {
				id: 's-678-random',
				label: '',
				type: 'class',
				variants: [],
			},
		} );

		expect( setSettingsCommand ).toBeCalledWith( 'document/elements/set-settings', {
			container: nestedStyledElement,
			settings: {
				classes: { $$type: 'classes', value: [ 's-678-random' ] },
			},
		} );

		expect( setSettingsCommand ).toBeCalledWith( 'document/elements/set-settings', {
			container: duplicatedStyledElement,
			settings: {
				classes: { $$type: 'classes', value: [ 's-567-random' ] },
			},
		} );
	} );

	it.each( hookNames )( 'should not do anything if no styled elements are duplicated on %d', async ( hook ) => {
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
