import { createContainer, addChildToContainer } from '../../../create-container';
import { setGlobalContainers } from './utils/set-global-containers';

describe( 'Paste element - apply', () => {
	let pasteElementHook;

	beforeAll( async () => {
		global._ = {
			debounce: ( cb ) => ( () => cb() ),
		};

		let uniqueId = 0;

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

		const PasteElementHook = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/hooks/data/duplicated-styles/paste-element' ) ).default;
		const SetSettingsCommand = ( await import( 'elementor-document/elements/commands-internal/set-settings' ) ).default;

		// For mocking the randomId method
		pasteElementHook = new PasteElementHook();

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
		delete global._;

		jest.resetAllMocks();
	} );

	it( 'should detect all atomic widgets with local styles within the pasted container, and the container itself, and regenerate an id to each of the styles', () => {
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
				's-456-1': {		// This widget is the outcome of the duplication command - all of the original settings are copied, including the style id
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

		addChildToContainer( container, styledElement );
		addChildToContainer( container, duplicatedStyledElement );

		setGlobalContainers( [ container, styledElement, duplicatedStyledElement ] );

		const runCommand = global.$e.run = jest.fn();

		// Act
		// The container already has the pasted element at the point of the hook execution
		// The original command expects to get the container to paste the copied widget into
		pasteElementHook.apply( {
			containers: [ container ],
		} );

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( {
			's-123-1': {
				id: 's-123-1',
				label: '',
				type: 'class',
				variants: [],
			},
		} );

		expect( duplicatedStyledElement.settings.get( 'classes' ) ).toEqual( { $$type: 'classes', value: [ 's-567-1' ] } );

		expect( duplicatedStyledElement.model.get( 'styles' ) ).toEqual( {
			's-567-1': {
				id: 's-567-1',
				label: '',
				type: 'class',
				variants: [],
			},
		} );

		expect( runCommand ).toBeCalledWith( 'document/atomic-widgets/styles-update' );
	} );

	it( 'should not do anything if no styled elements are duplicated', () => {
		// Arrange
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

		const runCommand = global.$e.run = jest.fn();

		// Act
		pasteElementHook.apply( {
			containers: [ container ],
		} );

		// Assert
		expect( runCommand ).not.toBeCalled();
	} );
} );
