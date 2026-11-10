/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpService } from '@elementor/http-client';
import { isProActive } from '@elementor/utils';

import { service } from '../../service';
import { initManageVariableTool } from '../manage-variable-tool';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

jest.mock( '@elementor/utils', () => ( {
	...jest.requireActual( '@elementor/utils' ),
	isProActive: jest.fn( () => true ),
} ) );

jest.mock( '../../service', () => ( {
	service: {
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	},
} ) );

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';
const EVENT_DATA = { eventData: { executedBy: 'mcp_tool' } };

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

function mockProxyResult( result: Record< string, unknown > ) {
	return {
		data: {
			data: {
				status: result.status,
				results: [ { index: 0, ...result } ],
				dry_run: true,
			},
		},
	};
}

describe( 'manage-variable-tool', () => {
	let httpMock: { post: jest.Mock; get: jest.Mock };

	beforeEach( () => {
		httpMock = {
			post: jest.fn().mockResolvedValue( mockProxyResult( { status: 'ok' } ) ),
			get: jest.fn().mockResolvedValue( { data: { data: 'guide text' } } ),
		};
		( httpService as jest.Mock ).mockReturnValue( httpMock );
		( isProActive as jest.Mock ).mockReturnValue( true );
		jest.mocked( service.create ).mockClear();
		jest.mocked( service.update ).mockClear();
		jest.mocked( service.delete ).mockClear();
	} );

	it( 'validates create in dry run, then creates through the editor service', async () => {
		// Arrange.
		const { registeredTool } = createMockRegistry();
		const params = { action: 'create', type: 'global-color-variable', label: 'brand', value: '#000' };

		// Act.
		const result = await registeredTool.handler( params );

		// Assert.
		expect( httpMock.post ).toHaveBeenCalledWith( MCP_PROXY_URL, {
			tool: 'manage-global-variable',
			input: { operations: [ params ], dry_run: true },
		} );
		expect( service.create ).toHaveBeenCalledWith(
			{ type: 'global-color-variable', label: 'brand', value: '#000' },
			EVENT_DATA
		);
		expect( result ).toEqual( { status: 'ok' } );
	} );

	it( 'updates through the editor service', async () => {
		// Arrange.
		const { registeredTool } = createMockRegistry();

		// Act.
		await registeredTool.handler( {
			action: 'update',
			id: 'v-abc1234',
			type: 'global-color-variable',
			label: 'brand',
			value: '#fff',
		} );

		// Assert.
		expect( service.update ).toHaveBeenCalledWith( 'v-abc1234', { label: 'brand', value: '#fff' }, EVENT_DATA );
	} );

	it( 'deletes through the editor service', async () => {
		// Arrange.
		const { registeredTool } = createMockRegistry();

		// Act.
		await registeredTool.handler( {
			action: 'delete',
			id: 'v-abc1234',
			type: 'global-color-variable',
			label: 'brand',
		} );

		// Assert.
		expect( service.delete ).toHaveBeenCalledWith( 'v-abc1234' );
	} );

	it( 'throws and changes nothing when the dry run rejects the operation', async () => {
		// Arrange.
		httpMock.post.mockResolvedValueOnce(
			mockProxyResult( { status: 'error', code: 'duplicated_label', message: 'duplicated label' } )
		);
		const { registeredTool } = createMockRegistry();

		// Act & Assert.
		await expect(
			registeredTool.handler( { action: 'create', type: 'global-color-variable', label: 'brand', value: '#000' } )
		).rejects.toThrow( 'duplicated label' );
		expect( service.create ).not.toHaveBeenCalled();
	} );

	it( 'fetches the guide resource from mcp-proxy GET', async () => {
		// Arrange.
		const { registeredResources } = createMockRegistry();
		const guide = registeredResources.find( ( r ) => r.name === 'manage-global-variable-guide' );
		const uri = new URL( 'elementor://variables/tools/manage-global-variable-guide' );

		// Act.
		const result = await guide?.handler( uri );

		// Assert.
		expect( httpMock.get ).toHaveBeenCalledWith( MCP_PROXY_URL, { params: { uri: uri.href } } );
		expect( result.contents[ 0 ].text ).toBe( 'guide text' );
	} );

	it( 'restricts tool enum to non-Pro types when Pro is inactive', () => {
		// Arrange.
		( isProActive as jest.Mock ).mockReturnValueOnce( false );

		// Act.
		const { registeredTool } = createMockRegistry();

		// Assert.
		expect( registeredTool.schema.type.options ).toEqual( [ 'global-color-variable', 'global-font-variable' ] );
	} );
} );
