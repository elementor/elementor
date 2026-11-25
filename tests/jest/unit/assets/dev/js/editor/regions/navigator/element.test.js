jest.mock( 'elementor/assets/dev/js/editor/regions/navigator/element-empty', () => class {}, { virtual: true } );
jest.mock( 'elementor/assets/dev/js/editor/regions/navigator/root-empty', () => class {}, { virtual: true } );

const ICON_FILTER = 'navigator/element/icon';
const MODEL_ICON = 'eicon-container';
const FILTERED_ICON = 'eicon-composite-widgets';

describe( 'Navigator element icon', () => {
	let NavigatorElement;
	let applyFilters;

	beforeAll( async () => {
		global.Marionette = { CompositeView: class {} };

		NavigatorElement = ( await import( 'elementor/assets/dev/js/editor/regions/navigator/element' ) ).default;
	} );

	afterAll( () => {
		delete global.Marionette;
	} );

	beforeEach( () => {
		applyFilters = jest.fn( ( name, value ) => ( ICON_FILTER === name ? FILTERED_ICON : value ) );

		global.elementor = {
			hooks: { applyFilters },
			navigator: { indicators: {} },
		};
		global.jQuery = { each: jest.fn() };
	} );

	afterEach( () => {
		delete global.elementor;
		delete global.jQuery;
	} );

	const createView = ( elType = 'container' ) => {
		const view = Object.create( NavigatorElement.prototype );

		view.model = {
			get: ( key ) => ( 'elType' === key ? elType : undefined ),
			getIcon: () => MODEL_ICON,
			getTitle: () => 'Title',
		};
		view.ui = {
			icon: { html: jest.fn() },
			title: { text: jest.fn() },
		};
		view.isNavigatorContainer = () => false;

		return view;
	};

	it( 'passes the row icon through the icon filter on render', () => {
		// Arrange.
		const view = createView();

		// Act.
		const helpers = view.templateHelpers();

		// Assert.
		expect( helpers.icon ).toBe( FILTERED_ICON );
		expect( applyFilters ).toHaveBeenCalledWith( ICON_FILTER, MODEL_ICON, view.model );
	} );

	it( 'renders no icon for sections', () => {
		// Arrange.
		const view = createView( 'section' );

		// Act.
		const helpers = view.templateHelpers();

		// Assert.
		expect( helpers.icon ).toBe( '' );
		expect( applyFilters ).not.toHaveBeenCalledWith( ICON_FILTER, expect.anything(), expect.anything() );
	} );

	it( 'passes the row icon through the icon filter when presetIcon changes', () => {
		// Arrange.
		const view = createView();

		// Act.
		view.onModelSettingsChange( { changed: { presetIcon: MODEL_ICON } } );

		// Assert.
		expect( view.ui.icon.html ).toHaveBeenCalledWith( `<i class="${ FILTERED_ICON }"></i>` );
	} );

	it( 'leaves the row icon untouched when presetIcon does not change', () => {
		// Arrange.
		const view = createView();

		// Act.
		view.onModelSettingsChange( { changed: { flex_direction: 'row' } } );

		// Assert.
		expect( view.ui.icon.html ).not.toHaveBeenCalled();
	} );
} );
