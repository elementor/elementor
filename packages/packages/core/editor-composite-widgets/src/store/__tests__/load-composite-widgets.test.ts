import { httpService } from '@elementor/http-client';
import { __createStore, __deleteStore, __registerSlice as registerSlice } from '@elementor/store';

import { getCompositeWidgetDefinition } from '../../sync/get-composite-widget-definition';
import { type CompositeWidgetDefinition } from '../../types';
import { loadCompositeWidgets, loadCompositeWidgetsFromConfig } from '../load-composite-widgets';
import { slice } from '../store';

jest.mock( '@elementor/http-client', () => ( { httpService: jest.fn() } ) );

const CONFIG_WIDGET_ID = 'elementor/icon-button';
const SITE_WIDGET_ID = 'site/promo-card';

const createDefinition = ( id: string, overrides: Partial< CompositeWidgetDefinition > = {} ) => ( {
	id,
	version: 1,
	title: id,
	template: { elType: 'e-flexbox' },
	...overrides,
} );

const setEditorConfig = ( compositeWidgets: unknown ) => {
	( window as unknown as { ElementorConfig: unknown } ).ElementorConfig = { compositeWidgets };
};

const mockRestResponse = ( data: unknown ) => {
	jest.mocked( httpService ).mockReturnValue( {
		get: jest.fn().mockResolvedValue( { data: { data } } ),
	} as unknown as ReturnType< typeof httpService > );
};

describe( 'composite widget definitions store', () => {
	beforeEach( () => {
		registerSlice( slice );
		__createStore();
	} );

	afterEach( () => {
		__deleteStore();
		delete ( window as unknown as { ElementorConfig?: unknown } ).ElementorConfig;
		jest.clearAllMocks();
	} );

	it( 'holds the definitions loaded before the store exists until it is created', () => {
		// Arrange.
		__deleteStore();
		registerSlice( slice );
		setEditorConfig( { [ CONFIG_WIDGET_ID ]: createDefinition( CONFIG_WIDGET_ID ) } );

		// Act.
		loadCompositeWidgetsFromConfig();
		__createStore();

		// Assert.
		expect( getCompositeWidgetDefinition( CONFIG_WIDGET_ID )?.id ).toBe( CONFIG_WIDGET_ID );
	} );

	it( 'has no definitions before the editor config is loaded', () => {
		// Arrange.
		setEditorConfig( { [ CONFIG_WIDGET_ID ]: createDefinition( CONFIG_WIDGET_ID ) } );

		// Act.
		const definition = getCompositeWidgetDefinition( CONFIG_WIDGET_ID );

		// Assert.
		expect( definition ).toBeNull();
	} );

	it( 'loads the definitions from the editor config', () => {
		// Arrange.
		setEditorConfig( { [ CONFIG_WIDGET_ID ]: createDefinition( CONFIG_WIDGET_ID ) } );

		// Act.
		loadCompositeWidgetsFromConfig();

		// Assert.
		expect( getCompositeWidgetDefinition( CONFIG_WIDGET_ID )?.id ).toBe( CONFIG_WIDGET_ID );
	} );

	it( 'replaces the definitions with the ones loaded over REST', async () => {
		// Arrange.
		setEditorConfig( { [ CONFIG_WIDGET_ID ]: createDefinition( CONFIG_WIDGET_ID ) } );
		loadCompositeWidgetsFromConfig();
		mockRestResponse( { [ SITE_WIDGET_ID ]: createDefinition( SITE_WIDGET_ID, { archived: true } ) } );

		// Act.
		await loadCompositeWidgets();

		// Assert.
		expect( getCompositeWidgetDefinition( SITE_WIDGET_ID )?.archived ).toBe( true );
		expect( getCompositeWidgetDefinition( CONFIG_WIDGET_ID ) ).toBeNull();
	} );

	it( 'treats an empty PHP array as no definitions', async () => {
		// Arrange.
		setEditorConfig( [] );
		mockRestResponse( [] );

		// Act.
		loadCompositeWidgetsFromConfig();
		await loadCompositeWidgets();

		// Assert.
		expect( getCompositeWidgetDefinition( CONFIG_WIDGET_ID ) ).toBeNull();
	} );
} );
