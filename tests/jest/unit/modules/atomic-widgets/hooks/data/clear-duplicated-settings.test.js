import { createContainer, addChildToContainer, setGlobalContainers } from '../../utils/container';

describe( 'Clear duplicated settings', () => {
	let duplicateHook;

	const widgetsCache = {
		'e-div-block': { atomic_props_schema: { _cssid: { meta: { duplicate_behavior: 'clear' } } } },
		'e-heading': { atomic_props_schema: { _cssid: { meta: { duplicate_behavior: 'clear' } } } },
		'e-form-input': { atomic_props_schema: { _cssid: { meta: {} } } },
		'legacy-widget': {},
	};

	const getWidgetCache = ( model ) => {
		const elType = model.get( 'elType' );
		const widgetType = model.get( 'widgetType' );
		const elementType = 'widget' === elType ? widgetType : elType;

		return widgetsCache[ elementType ];
	};

	const registerContainers = ( containers ) => {
		setGlobalContainers( containers );
		global.elementor.helpers = { getWidgetCache };
	};

	const cssIdValue = ( value ) => ( { $$type: 'string', value } );

	beforeAll( async () => {
		global.$e = {
			modules: {
				hookData: {
					After: class {},
				},
			},
		};

		const { DuplicateElement } = await import( 'elementor/modules/atomic-widgets/assets/js/editor/hooks/data/clear-duplicated-settings/duplicate-element' );

		duplicateHook = new DuplicateElement();
	} );

	afterAll( () => {
		delete global.$e;
		delete global.elementor;
	} );

	beforeEach( () => {
		global.$e.internal = jest.fn();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'clears a populated _cssid on a duplicated atomic element', () => {
		const element = createContainer( {
			widgetType: 'e-heading',
			elType: 'widget',
			id: 'widget1',
			settings: { _cssid: cssIdValue( 'my-custom-id' ) },
		} );

		registerContainers( [ element ] );

		duplicateHook.apply( {}, [ element ] );

		expect( global.$e.internal ).toHaveBeenCalledTimes( 1 );
		expect( global.$e.internal ).toHaveBeenCalledWith( 'document/elements/set-settings', {
			container: element,
			settings: { _cssid: cssIdValue( null ) },
		} );
	} );

	it( 'does nothing when the duplicated atomic element has no _cssid value', () => {
		const withoutValue = createContainer( {
			widgetType: 'e-heading',
			elType: 'widget',
			id: 'widget1',
			settings: { _cssid: cssIdValue( '' ) },
		} );

		const withoutKey = createContainer( {
			widgetType: 'e-heading',
			elType: 'widget',
			id: 'widget2',
			settings: {},
		} );

		registerContainers( [ withoutValue, withoutKey ] );

		duplicateHook.apply( {}, [ withoutValue ] );
		duplicateHook.apply( {}, [ withoutKey ] );

		expect( global.$e.internal ).not.toHaveBeenCalled();
	} );

	it( 'clears _cssid across nested duplicated atomic elements', () => {
		const container = createContainer( {
			widgetType: 'e-div-block',
			elType: 'e-div-block',
			id: 'root',
			settings: { _cssid: cssIdValue( 'root-id' ) },
		} );

		const child = createContainer( {
			widgetType: 'e-heading',
			elType: 'widget',
			id: 'child',
			settings: { _cssid: cssIdValue( 'child-id' ) },
		} );

		addChildToContainer( container, child );
		registerContainers( [ container, child ] );

		duplicateHook.apply( {}, [ container ] );

		expect( global.$e.internal ).toHaveBeenCalledTimes( 2 );
		expect( global.$e.internal ).toHaveBeenCalledWith( 'document/elements/set-settings', {
			container,
			settings: { _cssid: cssIdValue( null ) },
		} );
		expect( global.$e.internal ).toHaveBeenCalledWith( 'document/elements/set-settings', {
			container: child,
			settings: { _cssid: cssIdValue( null ) },
		} );
	} );

	it( 'does not touch legacy (non-atomic) duplicated elements', () => {
		const legacy = createContainer( {
			widgetType: 'legacy-widget',
			elType: 'widget',
			id: 'legacy1',
			settings: { _cssid: cssIdValue( 'legacy-id' ) },
		} );

		registerContainers( [ legacy ] );

		duplicateHook.apply( {}, [ legacy ] );

		expect( global.$e.internal ).not.toHaveBeenCalled();
	} );

	it( 'leaves atomic props that do not opt into clearing untouched (e.g. atomic form fields)', () => {
		const formInput = createContainer( {
			widgetType: 'e-form-input',
			elType: 'widget',
			id: 'input1',
			settings: { _cssid: cssIdValue( 'e-form-input-old' ) },
		} );

		registerContainers( [ formInput ] );

		duplicateHook.apply( {}, [ formInput ] );

		expect( global.$e.internal ).not.toHaveBeenCalled();
	} );
} );
