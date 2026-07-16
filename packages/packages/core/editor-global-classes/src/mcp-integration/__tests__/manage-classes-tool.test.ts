/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpService } from '@elementor/http-client';

import { loadCurrentDocumentClasses } from '../../load-document-classes';
import { initManageClassesTool } from '../manage-classes-tool';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

jest.mock( '../../load-document-classes', () => ( {
	loadCurrentDocumentClasses: jest.fn().mockResolvedValue( undefined ),
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

	beforeEach( () => {
		httpMock = {
			post: jest.fn().mockResolvedValue( { data: { data: { status: 'ok' } } } ),
		};
		( httpService as jest.Mock ).mockReturnValue( httpMock );
		jest.mocked( loadCurrentDocumentClasses ).mockClear();
	} );

	it( 'proxies create action to mcp-proxy POST with tool name and input', async () => {
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
		expect( loadCurrentDocumentClasses ).toHaveBeenCalledTimes( 1 );
		expect( result ).toEqual( { status: 'ok' } );
	} );

	it( 'proxies update and delete actions as-is', async () => {
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

		await registeredTool.handler( { action: 'delete', id: 'g-abc1234' } );
		expect( httpMock.post ).toHaveBeenLastCalledWith(
			MCP_PROXY_URL,
			expect.objectContaining( {
				input: expect.objectContaining( { action: 'delete', id: 'g-abc1234' } ),
			} )
		);
		expect( loadCurrentDocumentClasses ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'propagates server errors from the proxy', async () => {
		httpMock.post.mockRejectedValueOnce( new Error( 'duplicated label' ) );

		const { registeredTool } = createMockRegistry();

		await expect(
			registeredTool.handler( {
				action: 'create',
				label: 'hero-heading',
				css: { color: '#000000' },
			} )
		).rejects.toThrow( 'duplicated label' );
		expect( loadCurrentDocumentClasses ).not.toHaveBeenCalled();
	} );
} );
