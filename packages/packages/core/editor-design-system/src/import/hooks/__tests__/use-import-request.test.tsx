import * as React from 'react';
import { GLOBAL_STYLES_IMPORTED_EVENT, type ImportedGlobalStylesPayload } from '@elementor/editor-canvas';
import { httpService } from '@elementor/http-client';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useImportRequest } from '../use-import-request';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	__privateRunCommand: jest.fn().mockResolvedValue( undefined ),
} ) );

type HttpPostMock = jest.Mock< Promise< { data: unknown } >, [ url: string, body?: unknown ] >;

const setupHttpServiceMock = ( runnerResponses: Record< string, unknown > ) => {
	const post: HttpPostMock = jest.fn( ( url: string, body?: unknown ) => {
		if ( url.endsWith( '/upload' ) ) {
			return Promise.resolve( { data: { data: { session: 'sess-1' } } } );
		}
		if ( url.endsWith( '/import' ) ) {
			return Promise.resolve( {
				data: { data: { session: 'sess-1', runners: Object.keys( runnerResponses ) } },
			} );
		}
		const { runner } = body as { runner: string };
		return Promise.resolve( { data: { data: runnerResponses[ runner ] } } );
	} );
	( httpService as jest.Mock ).mockReturnValue( { post } );
};

const runImport = async () => {
	const queryClient = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
	const { result } = renderHook( () => useImportRequest(), {
		wrapper: ( { children } ) => <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>,
	} );

	const file = new File( [ 'zip' ], 'design-system.zip' );
	act( () => {
		result.current.mutate( { file, conflictStrategy: 'keep' } );
	} );

	await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
};

describe( 'useImportRequest', () => {
	let dispatchedEvent: CustomEvent< ImportedGlobalStylesPayload | undefined > | undefined;

	beforeEach( () => {
		jest.clearAllMocks();
		dispatchedEvent = undefined;
		window.addEventListener( GLOBAL_STYLES_IMPORTED_EVENT, ( event ) => {
			dispatchedEvent = event as CustomEvent< ImportedGlobalStylesPayload | undefined >;
		} );
	} );

	it( 'includes the newly created class ids from the global-classes runner response', async () => {
		setupHttpServiceMock( {
			'global-classes': {
				created: [ { result_entry: { id: 'g-1', label: 'Class One' } } ],
				renamed: [ { result_entry: { id: 'g-2', label: 'Class Two' } } ],
			},
			'global-variables': {
				imported_data: {
					created: [
						{ result_entry: { id: 'g-1', label: 'Class One' } },
						{ result_entry: { id: 'g-2', label: 'Class Two' } },
					],
					renamed: [],
				},
			},
		} );

		await runImport();

		expect( dispatchedEvent?.detail?.imported_class_ids ).toEqual( [ 'g-1', 'g-2' ] );
	} );

	it( 'does not include entries created by a runner that ran after global-classes', async () => {
		setupHttpServiceMock( {
			'global-classes': {
				created: [ { result_entry: { id: 'g-1', label: 'Class One' } } ],
			},
			'global-variables': {
				imported_data: {
					created: [
						{ result_entry: { id: 'g-1', label: 'Class One' } },
						{ result_entry: { id: 'v-1', label: 'Variable One' } },
					],
				},
			},
		} );

		await runImport();

		expect( dispatchedEvent?.detail?.imported_class_ids ).toEqual( [ 'g-1' ] );
	} );

	it( 'dispatches an event without imported_class_ids when nothing was created', async () => {
		setupHttpServiceMock( {
			'global-classes': { created: [], renamed: [] },
		} );

		await runImport();

		expect( dispatchedEvent?.detail ).toBeFalsy();
	} );
} );
