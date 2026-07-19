/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpService } from '@elementor/http-client';

import { globalClassesStylesProvider } from '../../global-classes-styles-provider';
import { slice } from '../../store';
import { initManageClassesTool } from '../manage-classes-tool';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

const mockDispatch = jest.fn();
jest.mock( '@elementor/store', () => ( {
	__dispatch: ( action: any ) => mockDispatch( action ),
} ) );

jest.mock( '../../global-classes-styles-provider', () => ( {
	globalClassesStylesProvider: {
		actions: {
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
	},
} ) );

jest.mock( '../../store', () => ( {
	slice: {
		actions: {
			reset: jest.fn( ( payload: any ) => ( { type: 'globalClasses/reset', payload } ) ),
		},
	},
} ) );

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';

function createMockRegistry() {
	let registeredTool: any = null;

	const reg = {
		addTool: ( tool: any ) => {
			registeredTool = tool;
		},
		resource: jest.fn(),
		setMCPDescription: jest.fn(),
		sendResourceUpdated: jest.fn(),
		waitForReady: jest.fn(),
	};

	initManageClassesTool( reg as any );

	return { registeredTool };
}

describe( 'manage-classes-tool (thin proxy wrapper)', () => {
	let httpMock: { post: jest.Mock };
	let dispatchEventSpy: jest.SpyInstance;

	beforeEach( () => {
		httpMock = {
			post: jest.fn().mockResolvedValue( {
				data: {
					data: {
						status: 'ok',
						class: { id: 'g-new123', label: 'hero-heading', variants: [] },
						order: [ 'g-new123' ],
					},
				},
			} ),
		};
		( httpService as jest.Mock ).mockReturnValue( httpMock );
		mockDispatch.mockClear();
		jest.mocked( globalClassesStylesProvider.actions.create ).mockClear();
		jest.mocked( globalClassesStylesProvider.actions.update ).mockClear();
		jest.mocked( globalClassesStylesProvider.actions.delete ).mockClear();
		jest.mocked( slice.actions.reset ).mockClear();
		dispatchEventSpy = jest.spyOn( window, 'dispatchEvent' );
	} );

	afterEach( () => {
		dispatchEventSpy.mockRestore();
	} );

	it( 'proxies create action and mutates store locally', async () => {
		const { registeredTool } = createMockRegistry();

		const result = await registeredTool.handler( {
			action: 'create',
			label: 'hero-heading',
			css: { color: '#000000' },
		} );

		expect( httpMock.post ).toHaveBeenCalledWith( MCP_PROXY_URL, {
			tool: 'manage-classes',
			input: {
				action: 'create',
				label: 'hero-heading',
				css: { color: '#000000' },
			},
		} );
		expect( globalClassesStylesProvider.actions.create ).toHaveBeenCalledWith(
			'hero-heading',
			[],
			'g-new123'
		);
		expect( slice.actions.reset ).toHaveBeenCalledWith( { context: 'frontend' } );
		expect( dispatchEventSpy ).toHaveBeenCalledWith(
			expect.objectContaining( {
				type: 'classes:updated',
				detail: { context: 'frontend' },
			} )
		);
		expect( result ).toEqual( { status: 'ok' } );
	} );

	it( 'proxies update action and mutates store locally', async () => {
		const updatedClass = { id: 'g-abc1234', label: 'hero-heading', variants: [ { meta: {}, props: {} } ] };
		httpMock.post.mockResolvedValueOnce( {
			data: {
				data: {
					status: 'ok',
					class: updatedClass,
					order: [ 'g-abc1234' ],
				},
			},
		} );

		const { registeredTool } = createMockRegistry();

		await registeredTool.handler( {
			action: 'update',
			id: 'g-abc1234',
			label: 'hero-heading',
			css: { color: '#ffffff' },
		} );

		expect( httpMock.post ).toHaveBeenLastCalledWith(
			MCP_PROXY_URL,
			expect.objectContaining( {
				tool: 'manage-classes',
				input: expect.objectContaining( { action: 'update', id: 'g-abc1234' } ),
			} )
		);
		expect( globalClassesStylesProvider.actions.update ).toHaveBeenCalledWith( updatedClass );
		expect( slice.actions.reset ).toHaveBeenCalledWith( { context: 'frontend' } );
	} );

	it( 'proxies delete action and mutates store locally', async () => {
		httpMock.post.mockResolvedValueOnce( {
			data: {
				data: {
					status: 'ok',
					class: { id: 'g-abc1234', label: 'hero-heading', variants: [] },
					order: [],
				},
			},
		} );

		const { registeredTool } = createMockRegistry();

		await registeredTool.handler( { action: 'delete', id: 'g-abc1234' } );

		expect( httpMock.post ).toHaveBeenLastCalledWith(
			MCP_PROXY_URL,
			expect.objectContaining( {
				input: expect.objectContaining( { action: 'delete', id: 'g-abc1234' } ),
			} )
		);
		expect( globalClassesStylesProvider.actions.delete ).toHaveBeenCalledWith( 'g-abc1234' );
		expect( slice.actions.reset ).toHaveBeenCalledWith( { context: 'frontend' } );
	} );

	it( 'propagates server errors from the proxy without mutating store', async () => {
		httpMock.post.mockRejectedValueOnce( new Error( 'duplicated label' ) );

		const { registeredTool } = createMockRegistry();

		await expect(
			registeredTool.handler( {
				action: 'create',
				label: 'hero-heading',
				css: { color: '#000000' },
			} )
		).rejects.toThrow( 'duplicated label' );

		expect( globalClassesStylesProvider.actions.create ).not.toHaveBeenCalled();
		expect( slice.actions.reset ).not.toHaveBeenCalled();
	} );
} );
