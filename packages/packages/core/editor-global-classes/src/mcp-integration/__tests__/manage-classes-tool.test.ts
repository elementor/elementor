/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpService } from '@elementor/http-client';

import { globalClassesStylesProvider } from '../../global-classes-styles-provider';
import { initManageClassesTool } from '../manage-classes-tool';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
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

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';

const VARIANTS = [ { meta: { breakpoint: 'desktop', state: null }, props: {} } ];

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

function mockProxyResult( result: Record< string, unknown > ) {
	return {
		data: {
			data: {
				status: result.status,
				results: [ { index: 0, ...result } ],
				order: [],
				dry_run: true,
			},
		},
	};
}

describe( 'manage-classes-tool', () => {
	let httpMock: { post: jest.Mock };
	let dispatchEventSpy: jest.SpyInstance;

	beforeEach( () => {
		httpMock = { post: jest.fn() };
		( httpService as jest.Mock ).mockReturnValue( httpMock );
		( globalClassesStylesProvider.actions.create as jest.Mock ).mockClear();
		( globalClassesStylesProvider.actions.update as jest.Mock ).mockClear();
		( globalClassesStylesProvider.actions.delete as jest.Mock ).mockClear();
		dispatchEventSpy = jest.spyOn( window, 'dispatchEvent' );
	} );

	afterEach( () => {
		dispatchEventSpy.mockRestore();
	} );

	it( 'calls the proxy in dry run and creates the planned class locally', async () => {
		// Arrange.
		httpMock.post.mockResolvedValue(
			mockProxyResult( {
				status: 'ok',
				action: 'create',
				id: 'g-new123',
				label: 'hero-heading',
				type: 'class',
				variants: VARIANTS,
			} )
		);
		const { registeredTool } = createMockRegistry();

		// Act.
		const result = await registeredTool.handler( {
			action: 'create',
			label: 'hero-heading',
			css: 'color: #000000;',
		} );

		// Assert.
		expect( httpMock.post ).toHaveBeenCalledWith( MCP_PROXY_URL, {
			tool: 'manage-classes',
			input: {
				operations: [ { action: 'create', label: 'hero-heading', css: 'color: #000000;' } ],
				dry_run: true,
			},
		} );
		expect( globalClassesStylesProvider.actions.create ).toHaveBeenCalledWith(
			'hero-heading',
			VARIANTS,
			'g-new123'
		);
		expect( dispatchEventSpy ).not.toHaveBeenCalledWith( expect.objectContaining( { type: 'classes:updated' } ) );
		expect( result ).toEqual( { status: 'ok', id: 'g-new123', label: 'hero-heading' } );
	} );

	it( 'applies the planned update locally', async () => {
		// Arrange.
		httpMock.post.mockResolvedValue(
			mockProxyResult( {
				status: 'ok',
				action: 'update',
				id: 'g-abc1234',
				label: 'hero-heading',
				type: 'class',
				variants: VARIANTS,
			} )
		);
		const { registeredTool } = createMockRegistry();

		// Act.
		await registeredTool.handler( { action: 'update', id: 'g-abc1234', css: 'color: #ffffff;' } );

		// Assert.
		expect( globalClassesStylesProvider.actions.update ).toHaveBeenCalledWith( {
			id: 'g-abc1234',
			label: 'hero-heading',
			type: 'class',
			variants: VARIANTS,
		} );
	} );

	it( 'throws instead of skipping when the planned update is incomplete', async () => {
		// Arrange.
		httpMock.post.mockResolvedValue(
			mockProxyResult( { status: 'ok', action: 'update', id: 'g-abc1234', label: 'hero-heading' } )
		);
		const { registeredTool } = createMockRegistry();

		// Act & Assert.
		await expect(
			registeredTool.handler( { action: 'update', id: 'g-abc1234', css: 'color: #ffffff;' } )
		).rejects.toThrow( 'Planned class is incomplete in the response' );
		expect( globalClassesStylesProvider.actions.update ).not.toHaveBeenCalled();
	} );

	it( 'deletes the class resolved by the server, even when only a label was given', async () => {
		// Arrange.
		httpMock.post.mockResolvedValue(
			mockProxyResult( { status: 'ok', action: 'delete', id: 'g-abc1234', label: 'hero-heading' } )
		);
		const { registeredTool } = createMockRegistry();

		// Act.
		await registeredTool.handler( { action: 'delete', label: 'hero-heading' } );

		// Assert.
		expect( globalClassesStylesProvider.actions.delete ).toHaveBeenCalledWith( 'g-abc1234' );
	} );

	it( 'throws and changes nothing locally when the server rejects the operation', async () => {
		// Arrange.
		httpMock.post.mockResolvedValue(
			mockProxyResult( {
				status: 'error',
				action: 'update',
				code: 'class_not_found',
				message: 'Global class not found',
			} )
		);
		const { registeredTool } = createMockRegistry();

		// Act & Assert.
		await expect( registeredTool.handler( { action: 'update', id: 'g-missing' } ) ).rejects.toThrow(
			'Global class not found'
		);
		expect( globalClassesStylesProvider.actions.update ).not.toHaveBeenCalled();
	} );
} );
