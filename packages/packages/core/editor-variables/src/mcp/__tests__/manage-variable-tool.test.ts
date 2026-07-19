/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpService } from '@elementor/http-client';
import { isProActive } from '@elementor/utils';

import { initManageVariableTool } from '../manage-variable-tool';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

jest.mock( '@elementor/utils', () => ( {
	...jest.requireActual( '@elementor/utils' ),
	isProActive: jest.fn( () => true ),
} ) );

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';

function createMockRegistry() {
	let registeredTool: any = null;
	const registeredResources: Array< { name: string; uri: string; handler: any } > = [];

	const reg = {
		addTool: ( tool: any ) => {
			registeredTool = tool;
		},
		resource: ( name: string, uri: string, _opts: any, handler: any ) => {
			registeredResources.push( { name, uri, handler } );
		},
		setMCPDescription: jest.fn(),
		sendResourceUpdated: jest.fn(),
		waitForReady: jest.fn(),
	};

	initManageVariableTool( reg as any );

	return { registeredTool, registeredResources };
}

describe( 'manage-variable-tool (thin proxy wrapper)', () => {
	let httpMock: { post: jest.Mock; get: jest.Mock };

	beforeEach( () => {
		httpMock = {
			post: jest.fn().mockResolvedValue( { data: { data: { status: 'ok' } } } ),
			get: jest.fn().mockResolvedValue( { data: { data: 'guide text' } } ),
		};
		( httpService as jest.Mock ).mockReturnValue( httpMock );
		( isProActive as jest.Mock ).mockReturnValue( true );
	} );

	it( 'proxies create action to mcp-proxy POST with tool name and input', async () => {
		const { registeredTool } = createMockRegistry();

		const result = await registeredTool.handler( {
			action: 'create',
			type: 'global-color-variable',
			label: 'brand',
			value: '#000',
		} );

		expect( httpMock.post ).toHaveBeenCalledWith( MCP_PROXY_URL, {
			tool: 'manage-global-variable',
			input: {
				action: 'create',
				type: 'global-color-variable',
				label: 'brand',
				value: '#000',
			},
		} );
		expect( result ).toEqual( { status: 'ok' } );
	} );

	it( 'proxies update and delete actions as-is', async () => {
		const { registeredTool } = createMockRegistry();

		await registeredTool.handler( { action: 'update', id: 'abc', label: 'brand', value: '#000' } );
		expect( httpMock.post ).toHaveBeenLastCalledWith(
			MCP_PROXY_URL,
			expect.objectContaining( {
				tool: 'manage-global-variable',
				input: expect.objectContaining( { action: 'update', id: 'abc' } ),
			} )
		);

		await registeredTool.handler( { action: 'delete', id: 'abc' } );
		expect( httpMock.post ).toHaveBeenLastCalledWith(
			MCP_PROXY_URL,
			expect.objectContaining( {
				input: expect.objectContaining( { action: 'delete', id: 'abc' } ),
			} )
		);
	} );

	it( 'propagates server errors from the proxy', async () => {
		httpMock.post.mockRejectedValueOnce( new Error( 'duplicated label' ) );

		const { registeredTool } = createMockRegistry();

		await expect(
			registeredTool.handler( { action: 'create', type: 'global-color-variable', label: 'brand', value: '#000' } )
		).rejects.toThrow( 'duplicated label' );
	} );

	it( 'fetches the guide resource from mcp-proxy GET', async () => {
		const { registeredResources } = createMockRegistry();
		const guide = registeredResources.find( ( r ) => r.name === 'manage-global-variable-guide' );

		const uri = new URL( 'elementor://variables/tools/manage-global-variable-guide' );
		const result = await guide?.handler( uri );

		expect( httpMock.get ).toHaveBeenCalledWith( MCP_PROXY_URL, {
			params: { uri: uri.href },
		} );
		expect( result.contents[ 0 ].text ).toBe( 'guide text' );
		expect( result.contents[ 0 ].mimeType ).toBe( 'text/plain' );
	} );

	it( 'restricts tool enum to non-Pro types when Pro is inactive', () => {
		( isProActive as jest.Mock ).mockReturnValueOnce( false );
		const { registeredTool } = createMockRegistry();

		const typeSchema = registeredTool.schema.type;
		// The zod enum values are exposed via .options.
		expect( typeSchema.options ).toEqual( [ 'global-color-variable', 'global-font-variable' ] );
	} );
} );
