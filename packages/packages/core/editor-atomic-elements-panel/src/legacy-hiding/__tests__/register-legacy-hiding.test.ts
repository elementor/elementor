import { dispatchV1ReadyEvent } from 'test-utils';
import { getWidgetsCache } from '@elementor/editor-elements';
import { __privateSetReady } from '@elementor/editor-v1-adapters';

import { filterLegacyCollections } from '../filter-legacy-collections';
import { getLegacyHiddenTypes } from '../get-legacy-hidden-types';
import type * as StateModule from '../legacy-hiding-state';
import type * as RegisterModule from '../register-legacy-hiding';
import { registerLegacyHiding } from '../register-legacy-hiding';
import { type LegacyCollections } from '../types';

jest.mock( '@elementor/editor-elements', () => ( { getWidgetsCache: jest.fn() } ) );
jest.mock( '../filter-legacy-collections' );
jest.mock( '../get-legacy-hidden-types' );

const FILTER_NAME = 'panel/elements/collections';

type Handler = ( collections: LegacyCollections ) => LegacyCollections;

type WindowWithHooks = { elementor?: { hooks: { addFilter: jest.Mock } } };

function setHooks() {
	const addFilter = jest.fn();

	( window as unknown as WindowWithHooks ).elementor = { hooks: { addFilter } };

	return addFilter;
}

// The kill switch is module state, so load a fresh copy to keep it from leaking into other tests.
function loadIsolatedModules() {
	let modules!: {
		registerLegacyHiding: typeof RegisterModule.registerLegacyHiding;
		disableLegacyHiding: typeof StateModule.disableLegacyHiding;
		filterLegacyCollections: jest.MockedFunction< typeof filterLegacyCollections >;
	};

	jest.isolateModules( () => {
		modules = {
			registerLegacyHiding: require( '../register-legacy-hiding' ).registerLegacyHiding,
			disableLegacyHiding: require( '../legacy-hiding-state' ).disableLegacyHiding,
			filterLegacyCollections: require( '../filter-legacy-collections' ).filterLegacyCollections,
		};
	} );

	return modules;
}

const registeredHandler = ( addFilter: jest.Mock ): Handler => addFilter.mock.calls[ 0 ][ 1 ];

const collections = {
	elementsCollection: { models: [] },
	categoriesCollection: { models: [] },
} as unknown as LegacyCollections;

describe( 'registerLegacyHiding', () => {
	afterEach( () => {
		delete ( window as unknown as WindowWithHooks ).elementor;
		__privateSetReady( false );
		jest.clearAllMocks();
	} );

	it( 'should register the collections filter immediately when the hooks exist', () => {
		// Arrange.
		const addFilter = setHooks();

		// Act.
		registerLegacyHiding();

		// Assert.
		expect( addFilter ).toHaveBeenCalledTimes( 1 );
		expect( addFilter ).toHaveBeenCalledWith( FILTER_NAME, expect.any( Function ) );
	} );

	it( 'should register the collections filter once v1 is ready when the hooks are not available yet', () => {
		// Arrange.
		registerLegacyHiding();
		const addFilter = setHooks();

		// Act.
		dispatchV1ReadyEvent();

		// Assert.
		expect( addFilter ).toHaveBeenCalledTimes( 1 );
		expect( addFilter ).toHaveBeenCalledWith( FILTER_NAME, expect.any( Function ) );
	} );

	it( 'should filter the collections by the types hidden for the current widgets cache', () => {
		// Arrange.
		const addFilter = setHooks();
		const cache = { 'e-heading': { title: 'Heading' } };
		const hiddenTypes = new Set( [ 'e-heading' ] );
		const filtered = { ...collections };
		jest.mocked( getWidgetsCache ).mockReturnValue( cache as unknown as ReturnType< typeof getWidgetsCache > );
		jest.mocked( getLegacyHiddenTypes ).mockReturnValue( hiddenTypes );
		jest.mocked( filterLegacyCollections ).mockReturnValue( filtered );
		registerLegacyHiding();

		// Act.
		const result = registeredHandler( addFilter )( collections );

		// Assert.
		expect( getLegacyHiddenTypes ).toHaveBeenCalledWith( cache );
		expect( filterLegacyCollections ).toHaveBeenCalledWith( collections, hiddenTypes );
		expect( result ).toBe( filtered );
	} );

	it( 'should return the collections unchanged once legacy hiding is disabled', () => {
		// Arrange.
		const addFilter = setHooks();
		const isolated = loadIsolatedModules();
		isolated.registerLegacyHiding();

		// Act.
		isolated.disableLegacyHiding();
		const result = registeredHandler( addFilter )( collections );

		// Assert.
		expect( result ).toBe( collections );
		expect( isolated.filterLegacyCollections ).not.toHaveBeenCalled();
	} );
} );
