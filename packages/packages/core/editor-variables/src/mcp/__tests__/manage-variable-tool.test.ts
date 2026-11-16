/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpService } from '@elementor/http-client';
import { isProActive } from '@elementor/utils';

import { service } from '../../service';
import { initManageVariableTool } from '../manage-variable-tool';
import { getPendingAbilityOperations, resetPendingVariableChanges } from '../pending-variable-changes';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

jest.mock( '@elementor/utils', () => ( {
	...jest.requireActual( '@elementor/utils' ),
	isProActive: jest.fn( () => true ),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateRunCommandSync: jest.fn(),
	registerDataHook: jest.fn(),
} ) );

jest.mock( '../../service', () => ( {
	service: {
		variables: jest.fn( () => ( {} ) ),
		applyLocalChange: jest.fn(),
		saveOperations: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	},
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

function mockProxyResults( results: Array< Record< string, unknown > > ) {
	return {
		data: {
			data: {
				status: 'ok',
				results: results.map( ( result, index ) => ( { index, ...result } ) ),
				dry_run: true,
			},
		},
	};
}

describe( 'manage-variable-tool', () => {
	let httpMock: { post: jest.Mock; get: jest.Mock };

	beforeEach( () => {
		resetPendingVariableChanges();
		httpMock = {
			post: jest.fn(),
			get: jest.fn().mockResolvedValue( { data: { data: 'guide text' } } ),
		};
		( httpService as jest.Mock ).mockReturnValue( httpMock );
		( isProActive as jest.Mock ).mockReturnValue( true );
		jest.mocked( service.variables ).mockReturnValue( {} );
		jest.mocked( service.applyLocalChange ).mockClear();
		jest.mocked( service.create ).mockClear();
		jest.mocked( service.update ).mockClear();
		jest.mocked( service.delete ).mockClear();
	} );

	it( 'applies the planned create locally, without a second write, and returns the planned id', async () => {
		// Arrange.
		httpMock.post.mockResolvedValue(
			mockProxyResults( [
				{ status: 'ok', action: 'create', id: 'e-gv-a1b2c3d', label: 'brand', type: 'global-color-variable' },
			] )
		);
		const { registeredTool } = createMockRegistry();
		const params = { action: 'create', type: 'global-color-variable', label: 'brand', value: '#000' };

		// Act.
		const result = await registeredTool.handler( params );

		// Assert.
		expect( httpMock.post ).toHaveBeenCalledWith( MCP_PROXY_URL, {
			tool: 'manage-global-variable',
			input: { operations: [ params ], dry_run: true },
		} );
		expect( service.applyLocalChange ).toHaveBeenCalledWith(
			'e-gv-a1b2c3d',
			{ type: 'global-color-variable', label: 'brand', value: '#000' },
			true
		);
		expect( service.create ).not.toHaveBeenCalled();
		expect( result ).toEqual( { status: 'ok', id: 'e-gv-a1b2c3d' } );
	} );

	it( 'replays unsaved changes in the dry run so a later update can target a planned id', async () => {
		// Arrange.
		httpMock.post
			.mockResolvedValueOnce(
				mockProxyResults( [
					{
						status: 'ok',
						action: 'create',
						id: 'e-gv-a1b2c3d',
						label: 'brand',
						type: 'global-color-variable',
					},
				] )
			)
			.mockResolvedValueOnce(
				mockProxyResults( [
					{ status: 'ok', action: 'create', id: 'e-gv-a1b2c3d' },
					{
						status: 'ok',
						action: 'update',
						id: 'e-gv-a1b2c3d',
						label: 'brand',
						type: 'global-color-variable',
					},
				] )
			);
		const { registeredTool } = createMockRegistry();

		// Act.
		await registeredTool.handler( {
			action: 'create',
			type: 'global-color-variable',
			label: 'brand',
			value: '#000',
		} );
		const result = await registeredTool.handler( {
			action: 'update',
			id: 'e-gv-a1b2c3d',
			type: 'global-color-variable',
			label: 'brand',
			value: '#fff',
		} );

		// Assert.
		const secondInput = httpMock.post.mock.calls[ 1 ][ 1 ].input;
		expect( secondInput.operations ).toHaveLength( 2 );
		expect( secondInput.operations[ 0 ] ).toEqual(
			expect.objectContaining( { action: 'create', id: 'e-gv-a1b2c3d', label: 'brand' } )
		);
		expect( service.applyLocalChange ).toHaveBeenLastCalledWith(
			'e-gv-a1b2c3d',
			{ type: 'global-color-variable', label: 'brand', value: '#fff' },
			false
		);
		expect( service.update ).not.toHaveBeenCalled();
		expect( result ).toEqual( { status: 'ok', id: 'e-gv-a1b2c3d' } );
		expect( getPendingAbilityOperations() ).toHaveLength( 2 );
	} );

	it( 'marks a deleted variable locally', async () => {
		// Arrange.
		jest.mocked( service.variables ).mockReturnValue( {
			'e-gv-old': { type: 'global-color-variable', label: 'brand', value: '#000' },
		} );
		httpMock.post.mockResolvedValue( mockProxyResults( [ { status: 'ok', action: 'delete', id: 'e-gv-old' } ] ) );
		const { registeredTool } = createMockRegistry();

		// Act.
		await registeredTool.handler( {
			action: 'delete',
			id: 'e-gv-old',
			type: 'global-color-variable',
			label: 'brand',
		} );

		// Assert.
		expect( service.applyLocalChange ).toHaveBeenCalledWith(
			'e-gv-old',
			{ type: 'global-color-variable', label: 'brand', value: '#000', deleted: true },
			false
		);
		expect( service.delete ).not.toHaveBeenCalled();
	} );

	it( 'throws and changes nothing when the dry run rejects the operation', async () => {
		// Arrange.
		httpMock.post.mockResolvedValue(
			mockProxyResults( [ { status: 'error', code: 'duplicated_label', message: 'duplicated label' } ] )
		);
		const { registeredTool } = createMockRegistry();

		// Act & Assert.
		await expect(
			registeredTool.handler( { action: 'create', type: 'global-color-variable', label: 'brand', value: '#000' } )
		).rejects.toThrow( 'duplicated label' );
		expect( service.applyLocalChange ).not.toHaveBeenCalled();
		expect( getPendingAbilityOperations() ).toHaveLength( 0 );
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
