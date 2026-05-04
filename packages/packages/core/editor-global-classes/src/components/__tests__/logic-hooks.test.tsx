import * as React from 'react';
import { createMockHttpResponse, createMockStyleDefinition, renderWithStore } from 'test-utils';
import { getCurrentDocument } from '@elementor/editor-documents';
import { type HttpResponse } from '@elementor/http-client';
import { __createStore as createStore, __registerSlice as registerSlice } from '@elementor/store';
import { waitFor } from '@testing-library/react';

import { apiClient, type GlobalClassIndexEntry } from '../../api';
import { globalClassesStylesProvider } from '../../global-classes-styles-provider';
import { slice } from '../../store';
import { PopulateStore } from '../populate-store';

jest.mock( '../../api', () => ( {
	apiClient: {
		all: jest.fn(),
		getStylesForPost: jest.fn(),
	},
} ) );

jest.mock( '@elementor/editor-documents', () => ( {
	getCurrentDocument: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	registerDataHook: jest.fn(),
} ) );

describe( '<LogicHooks />', () => {
	let store: ReturnType< typeof createStore >;

	beforeEach( () => {
		registerSlice( slice );
		store = createStore();
		jest.mocked( getCurrentDocument ).mockReturnValue( { id: 1 } as never );
	} );

	it( 'should load document classes on mount', async () => {
		// Arrange
		const subscriber = jest.fn();

		globalClassesStylesProvider.subscribe( subscriber );

		const globalClass1 = createMockStyleDefinition( { id: 'global-1' } );
		const globalClass2 = createMockStyleDefinition( { id: 'global-2' } );

		const indexPayload: HttpResponse< GlobalClassIndexEntry[], Record< string, never > > = {
			data: [
				{ id: 'global-2', label: 'Class 2' },
				{ id: 'global-1', label: 'Class 1' },
			],
			meta: {},
		};

		const stylesPayload: HttpResponse<
			Record< string, ReturnType< typeof createMockStyleDefinition > >,
			{ order: string[] }
		> = {
			data: {
				'global-1': globalClass1,
				'global-2': globalClass2,
			},
			meta: { order: [ 'global-2', 'global-1' ] },
		};

		jest.mocked( apiClient.all ).mockResolvedValue( createMockHttpResponse( indexPayload ) );
		jest.mocked( apiClient.getStylesForPost ).mockResolvedValue( createMockHttpResponse( stylesPayload ) );

		const loadedItems = {
			'global-1': globalClass1,
			'global-2': globalClass2,
		};

		// Act
		renderWithStore( <PopulateStore />, store );

		// Assert
		await waitFor( () => {
			expect( subscriber ).toHaveBeenCalledTimes( 2 );
		} );

		// First call: reset with empty items to establish order and labels baseline
		expect( subscriber ).toHaveBeenNthCalledWith( 1, {}, {} );

		// Second call: loaded with actual class styles
		expect( subscriber ).toHaveBeenNthCalledWith( 2, {}, loadedItems );

		expect( globalClassesStylesProvider.actions.all() ).toEqual( [ globalClass2, globalClass1 ] );
	} );
} );
