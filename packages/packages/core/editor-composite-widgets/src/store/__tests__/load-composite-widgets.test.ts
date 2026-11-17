import { httpService } from '@elementor/http-client';
import { __createStore, __deleteStore, __registerSlice as registerSlice } from '@elementor/store';

import { getCompositeWidgetDefinition } from '../../sync/get-composite-widget-definition';
import { type CompositeWidgetDefinition } from '../../types';
import { loadCompositeWidgets } from '../load-composite-widgets';
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

const mockRestResponse = ( data: unknown ) => {
	jest.mocked( httpService ).mockReturnValue( {
		get: jest.fn().mockResolvedValue( { data: { data } } ),
	} as unknown as ReturnType< typeof httpService > );
};

describe( 'loadCompositeWidgets', () => {
	beforeEach( () => {
		( window as unknown as { elementor: unknown } ).elementor = {
			config: { compositeWidgets: { [ CONFIG_WIDGET_ID ]: createDefinition( CONFIG_WIDGET_ID ) } },
		};

		registerSlice( slice );
		__createStore();
	} );

	afterEach( () => {
		__deleteStore();
		delete ( window as unknown as { elementor?: unknown } ).elementor;
		jest.clearAllMocks();
	} );

	it( 'reads the editor config until definitions are loaded', () => {
		// Act.
		const definition = getCompositeWidgetDefinition( CONFIG_WIDGET_ID );

		// Assert.
		expect( definition?.id ).toBe( CONFIG_WIDGET_ID );
	} );

	it( 'replaces the editor config with the loaded definitions', async () => {
		// Arrange.
		mockRestResponse( { [ SITE_WIDGET_ID ]: createDefinition( SITE_WIDGET_ID, { archived: true } ) } );

		// Act.
		await loadCompositeWidgets();

		// Assert.
		expect( getCompositeWidgetDefinition( SITE_WIDGET_ID )?.archived ).toBe( true );
		expect( getCompositeWidgetDefinition( CONFIG_WIDGET_ID ) ).toBeNull();
	} );

	it( 'treats an empty PHP array as no definitions', async () => {
		// Arrange.
		mockRestResponse( [] );

		// Act.
		await loadCompositeWidgets();

		// Assert.
		expect( getCompositeWidgetDefinition( CONFIG_WIDGET_ID ) ).toBeNull();
	} );
} );
